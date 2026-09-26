/* The zigzag blog's spine and progress. Reads its section id from its script tag (data-section-id). Moved from sections/editorial--zigzag-blog.liquid. */
(function(){
  var sid      = document.currentScript.dataset.sectionId;
  var listEl   = document.getElementById('prf-items-'    + sid);
  var spineSvg = document.getElementById('prf-spine-'    + sid);
  var trackEl  = document.getElementById('prf-track-'    + sid);
  var fillEl   = document.getElementById('prf-fill-'     + sid);
  var progEl   = document.getElementById('prf-progress-' + sid);
  if (!listEl) return;

  var items   = Array.from(listEl.querySelectorAll('.prf-item'));
  var dots    = progEl ? Array.from(progEl.querySelectorAll('.prf-pdot')) : [];
  var pathLen = 0;

  function isMobile(){ return window.innerWidth <= 780; }

  /* ── Build wavy SVG spine path ──────────────────────── */
  function buildSpine(){
    if (isMobile() || !spineSvg || !trackEl || !fillEl) return;

    var H  = listEl.offsetHeight;
    var cx = 40, amp = 14;

    spineSvg.setAttribute('height', H);
    spineSvg.setAttribute('viewBox', '0 0 80 ' + H);

    var badges = listEl.querySelectorAll('.prf-badge');
    var lr     = listEl.getBoundingClientRect();
    var pts    = [];

    badges.forEach(function(b){
      var r = b.getBoundingClientRect();
      pts.push(r.top - lr.top + r.height / 2);
    });

    if (!pts.length) return;

    /* Start exactly at y=0 (top of items list = below subtitle) */
    var d = 'M' + cx + ' 0';
    d += ' C' + cx + ' ' + (pts[0] * 0.45) + ',' + cx + ' ' + (pts[0] * 0.72) + ',' + cx + ' ' + pts[0];

    for (var i = 0; i < pts.length - 1; i++){
      var y1  = pts[i];
      var y2  = pts[i + 1];
      var mid = (y1 + y2) / 2;
      var bmp = (i % 2 === 0) ? cx - amp : cx + amp;
      d += ' C' + cx   + ' ' + (y1 + (mid - y1) * 0.42) + ',' + bmp + ' ' + (mid - 30) + ',' + bmp + ' ' + mid;
      d += ' C' + bmp  + ' ' + (mid + 30) + ',' + cx + ' ' + (y2 - (y2 - mid) * 0.42) + ',' + cx + ' ' + y2;
    }

    var last = pts[pts.length - 1];
    d += ' C' + cx + ' ' + (last + (H - last) * 0.42) + ',' + cx + ' ' + (last + (H - last) * 0.72) + ',' + cx + ' ' + H;

    trackEl.setAttribute('d', d);
    fillEl.setAttribute('d', d);

    try {
      pathLen = fillEl.getTotalLength();
      fillEl.style.strokeDasharray  = pathLen + ' ' + pathLen;
      fillEl.style.strokeDashoffset = pathLen; /* fully hidden until scroll */
    } catch(e){}
  }

  /* ── Scroll handler ─────────────────────────────────── */
  function onScroll(){
    var wh = window.innerHeight;

    /* Sidebar visibility */
    if (progEl){
      var lr = listEl.getBoundingClientRect();
      progEl.classList.toggle('prf-progress--visible', lr.top < wh && lr.bottom > 0);
    }

    /* Scroll-draw the gold spine */
    if (!isMobile() && pathLen > 0 && fillEl){
      var lr  = listEl.getBoundingClientRect();
      /* pct: 0 when list top at viewport bottom → 1 when list bottom at viewport top */
      var pct = Math.min(1, Math.max(0, (wh - lr.top) / (lr.height + wh * 0.45)));
      fillEl.style.strokeDashoffset = pathLen * (1 - pct);
    }

    /* Reveal items & update dots */
    items.forEach(function(el, i){
      var r       = el.getBoundingClientRect();
      var visible = r.top < wh * 0.82;
      if (visible) el.classList.add('prf-in');
      if (dots[i]) dots[i].classList.toggle('prf-pdot--active', visible);
    });
  }

  /* ── Progress dot clicks ────────────────────────────── */
  dots.forEach(function(dot){
    dot.addEventListener('click', function(){
      var idx = parseInt(dot.dataset.target, 10) - 1;
      if (items[idx]) items[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  /* ── Init ───────────────────────────────────────────── */
  function init(){
    buildSpine();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function(){ buildSpine(); onScroll(); });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 80);
  }

  document.addEventListener('shopify:section:load', function(e){
    if (e.detail && e.detail.sectionId == sid) setTimeout(init, 100);
  });
})();
