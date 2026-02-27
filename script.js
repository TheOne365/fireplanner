/* =====================================================
   FIRE PLANNER — Enhanced Interactions & Animations
   ===================================================== */

/* ---- Newsletter ---- */
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thanks for subscribing!');
    this.reset();
  });
}

/* ---- Smooth scrolling ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* =====================================================
   SCROLL FADE-UP ANIMATION (Intersection Observer)
   ===================================================== */
const fadeObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fp-visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.calculator-card, .feature, .affiliate-card, .result-card, .input-panel, .results-panel'
).forEach((el, i) => {
  el.classList.add('fp-fade-up');
  el.style.transitionDelay = (i % 4) * 60 + 'ms';
  fadeObserver.observe(el);
});

/* =====================================================
   ANIMATED NUMBER COUNTER
   ===================================================== */
function animateValue(el, newText, duration) {
  duration = duration || 700;
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
}
window.animateValue = animateValue;

/* =====================================================
   INPUT FOCUS GLOW
   ===================================================== */
document.querySelectorAll('.form-group input, .form-group select').forEach(function(input) {
  input.addEventListener('focus', function() { input.classList.add('fp-input-focus'); });
  input.addEventListener('blur',  function() { input.classList.remove('fp-input-focus'); });
});

/* =====================================================
   BUTTON CLICK SCALE FEEDBACK
   ===================================================== */
document.querySelectorAll('button, .cta-button, .card-link').forEach(function(btn) {
  btn.addEventListener('mousedown', function() { btn.classList.add('fp-btn-press'); });
  btn.addEventListener('mouseup',   function() { btn.classList.remove('fp-btn-press'); });
  btn.addEventListener('mouseleave',function() { btn.classList.remove('fp-btn-press'); });
});

/* =====================================================
   HERO ANIMATED GRADIENT
   ===================================================== */
var hero = document.querySelector('.hero');
if (hero) {
  var tick = 0;
  function shiftHero() {
    tick += 0.003;
    var x = 20 + Math.sin(tick) * 8;
    var y = 50 + Math.cos(tick * 0.7) * 6;
    var darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    if (darkMode) {
      hero.style.backgroundImage =
        'radial-gradient(ellipse 80% 60% at ' + x + '% ' + y + '%, rgba(91,141,239,0.10) 0%, transparent 70%),' +
        'radial-gradient(ellipse 60% 70% at ' + (100-x) + '% ' + (100-y) + '%, rgba(255,140,90,0.08) 0%, transparent 70%),' +
        'linear-gradient(175deg, #0c1018 0%, #121a28 45%, #182030 100%)';
    } else {
      hero.style.backgroundImage =
        'radial-gradient(ellipse 80% 60% at ' + x + '% ' + y + '%, rgba(37,99,235,0.08) 0%, transparent 70%),' +
        'radial-gradient(ellipse 60% 70% at ' + (100-x) + '% ' + (100-y) + '%, rgba(255,107,53,0.06) 0%, transparent 70%),' +
        'linear-gradient(175deg, #1a2332 0%, #1e3050 45%, #2c3e5f 100%)';
    }
    requestAnimationFrame(shiftHero);
  }
  shiftHero();
}

/* =====================================================
   SHIMMER ON RECALCULATE
   ===================================================== */
window.shimmerResults = function() {
  document.querySelectorAll('.result-value').forEach(function(el) {
    el.classList.add('fp-shimmer');
    setTimeout(function() { el.classList.remove('fp-shimmer'); }, 400);
  });
};

/* =====================================================
   CHART.JS — animate on scroll into view
   ===================================================== */
window.observeChart = function(canvasId, chart) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var chartObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        chart.reset();
        chart.update();
        chartObserver.unobserve(canvas);
      }
    });
  }, { threshold: 0.2 });
  chartObserver.observe(canvas);
};

/* =====================================================
   TOOLTIPS — auto-init on all .fp-tip elements
   ===================================================== */
document.querySelectorAll('.fp-tip').forEach(function(tip) {
  tip.setAttribute('tabindex', '0');
  tip.setAttribute('role', 'button');
  tip.setAttribute('aria-label', 'More info');
  // Check if near right edge, flip bubble
  var rect = tip.getBoundingClientRect();
  if (rect.left > window.innerWidth * 0.6) tip.classList.add('flip-left');
});

/* =====================================================
   INPUT VALIDATION ENGINE
   Rules defined per input ID on each calc page via
   window.FP_VALIDATION = { 'input-id': { min, max, label, required } }
   ===================================================== */
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
      // Create error msg container
      var err = document.createElement('div');
      err.className = 'fp-error-msg';
      err.id = 'err-' + id;
      err.innerHTML = '<span>⚠</span><span class="fp-err-text"></span>';
      wrap.appendChild(err);
      // Validate on blur and input
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
      el.classList.add('fp-invalid');
      el.classList.remove('fp-valid');
      if (err) { err.querySelector('.fp-err-text').textContent = msg; err.classList.add('visible'); }
      return false;
    } else {
      el.classList.remove('fp-invalid');
      el.classList.add('fp-valid');
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
      el.classList.remove('fp-invalid');
      el.classList.add('fp-valid');
      var err = document.getElementById('err-' + id);
      if (err) err.classList.remove('visible');
    }
  },
  checkAll: function() {
    var self = this;
    return Object.keys(this.rules).every(function(id) { return self.check(id); });
  }
};

/* =====================================================
   SHARE RESULTS — Canvas-based card generator
   ===================================================== */
window.FPShare = {
  open: function(title, results) {
    // results = [{label, value}, ...]
    var modal = document.getElementById('fp-share-modal');
    if (!modal) { this._createModal(); modal = document.getElementById('fp-share-modal'); }
    this._drawCard(title, results);
    modal.classList.add('open');
  },
  _createModal: function() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var el = document.createElement('div');
    el.className = 'fp-modal-overlay';
    el.id = 'fp-share-modal';
    el.innerHTML = [
      '<div class="fp-modal">',
      '  <h3>📤 Share Your Results</h3>',
      '  <p>Download your results card to share on Instagram, Reddit, or with friends.</p>',
      '  <div class="fp-share-card-preview"><canvas id="fp-share-canvas" width="800" height="450"></canvas></div>',
      '  <div class="fp-modal-actions">',
      '    <button class="fp-modal-download" onclick="FPShare.download()">⬇ Download Image</button>',
      '    <button class="fp-modal-close" onclick="FPShare.close()">Close</button>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(el);
    // Close on overlay click
    el.addEventListener('click', function(e) { if (e.target === el) FPShare.close(); });
  },
  _drawCard: function(title, results) {
    var canvas = document.getElementById('fp-share-canvas');
    var ctx = canvas.getContext('2d');
    var w = 800, h = 450;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Background gradient
    var bg = ctx.createLinearGradient(0, 0, w, h);
    if (isDark) {
      bg.addColorStop(0, '#0f1219');
      bg.addColorStop(1, '#1a2332');
    } else {
      bg.addColorStop(0, '#1a2332');
      bg.addColorStop(1, '#2c3e5f');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Accent blob
    var radial = ctx.createRadialGradient(w * 0.8, h * 0.2, 0, w * 0.8, h * 0.2, 280);
    radial.addColorStop(0, 'rgba(255,107,53,0.18)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);

    var radial2 = ctx.createRadialGradient(w * 0.1, h * 0.8, 0, w * 0.1, h * 0.8, 200);
    radial2.addColorStop(0, 'rgba(37,99,235,0.18)');
    radial2.addColorStop(1, 'transparent');
    ctx.fillStyle = radial2;
    ctx.fillRect(0, 0, w, h);

    // Logo / brand row
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 18px "Work Sans", sans-serif';
    ctx.fillText('🔥 FIRE Planner · fireplanner.org', 48, 52);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(48, 68); ctx.lineTo(w - 48, 68); ctx.stroke();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px serif';
    ctx.fillText(title, 48, 116);

    // Results grid
    var cols = results.length <= 2 ? 2 : Math.min(results.length, 4);
    var cardW = (w - 96 - (cols - 1) * 16) / cols;
    var startY = 148;

    results.slice(0, cols).forEach(function(r, i) {
      var x = 48 + i * (cardW + 16);
      // Card bg
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      _roundRect(ctx, x, startY, cardW, 120, 12);
      ctx.fill();
      // Accent bar
      var colors = ['#ff6b35', '#2563eb', '#059669', '#d97706'];
      ctx.fillStyle = colors[i % colors.length];
      _roundRect(ctx, x, startY, cardW, 4, 2);
      ctx.fill();
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '500 12px "Work Sans", sans-serif';
      ctx.fillText(r.label.toUpperCase(), x + 16, startY + 30);
      // Value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px serif';
      var val = r.value;
      if (val.length > 12) {
        ctx.font = 'bold 20px serif';
      }
      ctx.fillText(val, x + 16, startY + 75);
    });

    // Second row if more than 4 results
    if (results.length > 4) {
      var row2 = results.slice(4, 8);
      var cols2 = Math.min(row2.length, 4);
      var cardW2 = (w - 96 - (cols2 - 1) * 16) / cols2;
      var startY2 = startY + 140;
      row2.forEach(function(r, i) {
        var x = 48 + i * (cardW2 + 16);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        _roundRect(ctx, x, startY2, cardW2, 100, 12); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = '500 11px "Work Sans", sans-serif';
        ctx.fillText(r.label.toUpperCase(), x + 14, startY2 + 26);
        ctx.fillStyle = '#e8ecf2';
        ctx.font = 'bold 22px serif';
        ctx.fillText(r.value, x + 14, startY2 + 64);
      });
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '13px "Work Sans", sans-serif';
    ctx.fillText('Free FIRE calculators at fireplanner.org · Not financial advice', 48, h - 24);
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

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* =====================================================
   MULTI-STEP CALCULATOR
   Usage: FPSteps.init(stepCount)
   ===================================================== */
window.FPSteps = {
  current: 0,
  total: 0,
  init: function(total, stepNames) {
    this.total = total;
    this.current = 0;
    this._renderBar(stepNames);
    this._show(0);
  },
  _renderBar: function(names) {
    var bar = document.getElementById('fp-steps-bar');
    if (!bar) return;
    var track = '<div class="fp-progress-track" id="fp-progress-track"></div>';
    var steps = '';
    for (var i = 0; i < this.total; i++) {
      steps += '<div class="fp-step' + (i === 0 ? ' active' : '') + '" data-step="' + i + '" onclick="FPSteps.goto(' + i + ')">' +
        '<div class="fp-step-dot">' + (i + 1) + '</div>' +
        '<div class="fp-step-label">' + (names[i] || 'Step ' + (i+1)) + '</div>' +
      '</div>';
    }
    bar.innerHTML = track + steps;
    this._updateTrack();
  },
  goto: function(n) {
    if (n < 0 || n >= this.total) return;
    this._hide(this.current);
    this.current = n;
    this._show(n);
    this._updateBar();
    this._updateTrack();
  },
  next: function() { this.goto(this.current + 1); },
  prev: function() { this.goto(this.current - 1); },
  _show: function(n) {
    var panel = document.getElementById('fp-panel-' + n);
    if (panel) panel.classList.add('active');
    var prevBtn = document.getElementById('fp-nav-prev-' + n);
    var nextBtn = document.getElementById('fp-nav-next-' + n);
    // update nav buttons
  },
  _hide: function(n) {
    var panel = document.getElementById('fp-panel-' + n);
    if (panel) panel.classList.remove('active');
  },
  _updateBar: function() {
    document.querySelectorAll('.fp-step').forEach(function(el) {
      var s = parseInt(el.getAttribute('data-step'));
      el.classList.remove('active', 'done');
      if (s === FPSteps.current) el.classList.add('active');
      else if (s < FPSteps.current) el.classList.add('done');
    });
  },
  _updateTrack: function() {
    var track = document.getElementById('fp-progress-track');
    if (!track) return;
    var pct = this.total <= 1 ? 100 : (this.current / (this.total - 1)) * 100;
    track.style.width = pct + '%';
  }
};
