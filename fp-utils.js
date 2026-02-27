/* =====================================================
   FIRE PLANNER — Core Utilities (loads early in <head>)
   animateValue, FPValidate, FPShare, FPSteps
   All defined on window so inline scripts can call them
   ===================================================== */

/* ---- Animated number counter ---- */
window.animateValue = function(el, newText, duration) {
  if (!el) return;
  duration = duration || 600;
  var numMatch = newText.match(/[\d,]+\.?\d*/);
  if (!numMatch) { el.textContent = newText; return; }
  var targetNum = parseFloat(numMatch[0].replace(/,/g, ''));
  var prefix = newText.slice(0, newText.indexOf(numMatch[0]));
  var suffix = newText.slice(newText.indexOf(numMatch[0]) + numMatch[0].length);
  var curMatch = el.textContent.match(/[\d,]+\.?\d*/);
  var startNum = curMatch ? parseFloat(curMatch[0].replace(/,/g, '')) : 0;
  if (startNum === targetNum) { el.textContent = newText; return; }
  var startTime = performance.now();
  var isCurrency = prefix.indexOf('$') !== -1 || newText.indexOf('$') === 0;
  function step(now) {
    var progress = Math.min((now - startTime) / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3);
    var current = startNum + (targetNum - startNum) * ease;
    if (isCurrency) {
      el.textContent = new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
        minimumFractionDigits: 0, maximumFractionDigits: 0
      }).format(Math.round(current)) + suffix;
    } else {
      el.textContent = prefix + Math.round(current).toLocaleString('en-US') + suffix;
    }
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = newText;
  }
  requestAnimationFrame(step);
};

/* ---- Input validation engine ---- */
window.FPValidate = {
  rules: {},
  init: function(rules) {
    this.rules = rules;
    var self = this;
    Object.keys(rules).forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var wrap = el.closest('.form-group');
      if (!wrap) return;
      if (!document.getElementById('err-' + id)) {
        var err = document.createElement('div');
        err.className = 'fp-error-msg';
        err.id = 'err-' + id;
        err.innerHTML = '<span>&#9888;</span><span class="fp-err-text"></span>';
        wrap.appendChild(err);
      }
      el.addEventListener('blur', function() { self.check(id); });
      el.addEventListener('input', function() {
        if (el.classList.contains('fp-invalid')) self.check(id);
        else self.checkValid(id);
      });
    });
  },
  check: function(id) {
    var el = document.getElementById(id);
    var rule = this.rules[id];
    if (!el || !rule) return true;
    var val = parseFloat(el.value);
    var err = document.getElementById('err-' + id);
    var msg = '';
    if (el.value === '' || isNaN(val)) {
      msg = (rule.label || 'This field') + ' is required.';
    } else if (rule.min !== undefined && val < rule.min) {
      msg = 'Enter at least ' + rule.min + (rule.unit || '.');
    } else if (rule.max !== undefined && val > rule.max) {
      msg = 'Maximum is ' + rule.max + (rule.unit || '.');
    } else if (rule.custom) {
      msg = rule.custom(val, el) || '';
    }
    if (msg) {
      el.classList.add('fp-invalid'); el.classList.remove('fp-valid');
      if (err) { err.querySelector('.fp-err-text').textContent = msg; err.classList.add('visible'); }
      return false;
    } else {
      el.classList.remove('fp-invalid'); el.classList.add('fp-valid');
      if (err) err.classList.remove('visible');
      return true;
    }
  },
  checkValid: function(id) {
    var el = document.getElementById(id);
    var rule = this.rules[id];
    if (!el || !rule) return;
    var val = parseFloat(el.value);
    if (!isNaN(val) && (rule.min === undefined || val >= rule.min) && (rule.max === undefined || val <= rule.max)) {
      el.classList.remove('fp-invalid'); el.classList.add('fp-valid');
      var err = document.getElementById('err-' + id);
      if (err) err.classList.remove('visible');
    }
  },
  checkAll: function() {
    var self = this;
    return Object.keys(this.rules).every(function(id) { return self.check(id); });
  }
};

/* ---- Share / canvas card generator ---- */
window.FPShare = {
  open: function(title, results) {
    var modal = document.getElementById('fp-share-modal');
    if (!modal) { this._createModal(); modal = document.getElementById('fp-share-modal'); }
    this._drawCard(title, results);
    modal.classList.add('open');
  },
  _createModal: function() {
    var el = document.createElement('div');
    el.className = 'fp-modal-overlay';
    el.id = 'fp-share-modal';
    el.innerHTML =
      '<div class="fp-modal">' +
      '<h3>&#128228; Share Your Results</h3>' +
      '<p>Download your results card to share on Instagram, Reddit, or with friends.</p>' +
      '<div class="fp-share-card-preview"><canvas id="fp-share-canvas" width="800" height="450"></canvas></div>' +
      '<div class="fp-modal-actions">' +
      '<button class="fp-modal-download" onclick="FPShare.download()">&#8595; Download Image</button>' +
      '<button class="fp-modal-close" onclick="FPShare.close()">Close</button>' +
      '</div></div>';
    document.body.appendChild(el);
    el.addEventListener('click', function(e) { if (e.target === el) FPShare.close(); });
  },
  _drawCard: function(title, results) {
    var canvas = document.getElementById('fp-share-canvas');
    var ctx = canvas.getContext('2d');
    var w = 800, h = 450;
    var bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#1a2332'); bg.addColorStop(1, '#2c3e5f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    var r1 = ctx.createRadialGradient(w*.8, h*.2, 0, w*.8, h*.2, 280);
    r1.addColorStop(0, 'rgba(255,107,53,0.20)'); r1.addColorStop(1, 'transparent');
    ctx.fillStyle = r1; ctx.fillRect(0, 0, w, h);
    var r2 = ctx.createRadialGradient(w*.1, h*.8, 0, w*.1, h*.8, 200);
    r2.addColorStop(0, 'rgba(37,99,235,0.20)'); r2.addColorStop(1, 'transparent');
    ctx.fillStyle = r2; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('\uD83D\uDD25 FIRE Planner  \u00B7  fireplanner.org', 48, 50);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(48, 65); ctx.lineTo(w-48, 65); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 32px serif';
    ctx.fillText(title, 48, 108);
    var cols = Math.min(results.length, 4);
    var cardW = (w - 96 - (cols-1)*14) / cols;
    var sy = 136;
    var colors = ['#ff6b35','#2563eb','#059669','#d97706'];
    results.slice(0, cols).forEach(function(r, i) {
      var x = 48 + i*(cardW+14);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      _rrect(ctx, x, sy, cardW, 118, 10); ctx.fill();
      ctx.fillStyle = colors[i]; _rrect(ctx, x, sy, cardW, 4, 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.52)';
      ctx.font = '600 11px sans-serif';
      ctx.fillText(r.label.toUpperCase().slice(0,22), x+14, sy+28);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold ' + (r.value.length > 10 ? '20' : '26') + 'px serif';
      ctx.fillText(r.value, x+14, sy+74);
    });
    ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.font = '12px sans-serif';
    ctx.fillText('fireplanner.org \u00B7 For educational purposes only. Not financial advice.', 48, h-22);
  },
  download: function() {
    var canvas = document.getElementById('fp-share-canvas');
    var a = document.createElement('a');
    a.download = 'fire-planner-results.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  },
  close: function() {
    var modal = document.getElementById('fp-share-modal');
    if (modal) modal.classList.remove('open');
  }
};

function _rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

/* ---- Multi-step wizard ---- */
window.FPSteps = {
  current: 0, total: 0,
  init: function(total, stepNames) {
    this.total = total; this.current = 0;
    this._renderBar(stepNames); this._show(0);
  },
  _renderBar: function(names) {
    var bar = document.getElementById('fp-steps-bar');
    if (!bar) return;
    var html = '<div class="fp-progress-track" id="fp-progress-track"></div>';
    for (var i = 0; i < this.total; i++) {
      html += '<div class="fp-step' + (i===0?' active':'') + '" data-step="'+i+'" onclick="FPSteps.goto('+i+')">' +
        '<div class="fp-step-dot">' + (i+1) + '</div>' +
        '<div class="fp-step-label">' + (names[i]||'Step '+(i+1)) + '</div></div>';
    }
    bar.innerHTML = html; this._updateTrack();
  },
  goto: function(n) {
    if (n<0||n>=this.total) return;
    this._hide(this.current); this.current=n;
    this._show(n); this._updateBar(); this._updateTrack();
  },
  next: function() { this.goto(this.current+1); },
  prev: function() { this.goto(this.current-1); },
  _show: function(n) { var p=document.getElementById('fp-panel-'+n); if(p) p.classList.add('active'); },
  _hide: function(n) { var p=document.getElementById('fp-panel-'+n); if(p) p.classList.remove('active'); },
  _updateBar: function() {
    document.querySelectorAll('.fp-step').forEach(function(el) {
      var s=parseInt(el.getAttribute('data-step'));
      el.classList.remove('active','done');
      if(s===FPSteps.current) el.classList.add('active');
      else if(s<FPSteps.current) el.classList.add('done');
    });
  },
  _updateTrack: function() {
    var t=document.getElementById('fp-progress-track'); if(!t) return;
    t.style.width=(this.total<=1?100:(this.current/(this.total-1))*100)+'%';
  }
};
