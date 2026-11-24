/* Hero background: drifting embers plus the odd lightning bolt, drawn on a canvas.
   Pauses when the hero scrolls off screen or the tab is hidden, and respects "reduce motion". */
(function () {
  'use strict';

  const canvas = document.getElementById('sparks');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  const YELLOW = '255,210,63';

  let w = 0, h = 0, dpr = 1, embers = [], bolt = null, nextBolt = 2, running = true, last = performance.now();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (w * h) / 14000));
    embers = Array.from({ length: count }, () => spawn(true));
  }

  function spawn(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.8,
      vy: 8 + Math.random() * 22,
      sway: Math.random() * Math.PI * 2,
      a: 0.25 + Math.random() * 0.55,
    };
  }

  // a jagged bolt from somewhere near the top, branching once or twice
  function makeBolt() {
    const pts = []; let x = w * (0.15 + Math.random() * 0.7), y = -10;
    while (y < h * (0.45 + Math.random() * 0.3)) { pts.push([x, y]); x += (Math.random() - 0.5) * 60; y += 18 + Math.random() * 30; }
    pts.push([x, y]);
    const branch = pts.length > 4 ? pts.slice(Math.floor(pts.length / 2)).map(([bx, by], i) => [bx + i * (Math.random() * 18 + 6), by + i * 6]) : null;
    return { pts, branch, life: 0.45 };
  }

  function stroke(pts, alpha, width) {
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = `rgba(${YELLOW},${alpha})`; ctx.lineWidth = width; ctx.stroke();
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    ctx.clearRect(0, 0, w, h);

    for (const e of embers) {
      e.y -= e.vy * dt; e.sway += dt * 1.3; e.x += Math.sin(e.sway) * 8 * dt;
      if (e.y < -10) Object.assign(e, spawn(false));
      const fade = Math.min(1, e.y / (h * 0.25));
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${YELLOW},${e.a * fade})`; ctx.fill();
    }

    nextBolt -= dt;
    if (nextBolt <= 0) { bolt = makeBolt(); nextBolt = 3 + Math.random() * 5; }
    if (bolt) {
      bolt.life -= dt; const k = Math.max(0, bolt.life / 0.45);
      ctx.save(); ctx.shadowColor = `rgba(${YELLOW},1)`; ctx.shadowBlur = 18;
      stroke(bolt.pts, 0.55 * k, 2.4); if (bolt.branch) stroke(bolt.branch, 0.35 * k, 1.4);
      ctx.restore();
      if (bolt.life <= 0) bolt = null;
    }
  }

  const start = () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } };
  const stop = () => { running = false; };
  new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  addEventListener('resize', resize);
  resize(); requestAnimationFrame(frame);
})();
