/* Ninebolt Studios website.
   Every game card, app button, stat and footer link is built from the GAMES list below,
   so adding a new game to the site means adding one entry here. */
(function () {
  'use strict';

  const BASE = 'https://ninebolt-studios.github.io/';

  const GAMES = [
    {
      id: 'ashfall',
      name: 'ASHFALL',
      short: 'Ashfall',
      path: 'Ashfall/',
      profile: 'Ashfall/Ashfall.mobileconfig',
      icon: 'ashfall-icon.png',
      tag: 'OUT NOW · FREE',
      accent: null, // uses the site's default orange play button
      art: { logo: 'ashfall-logo-clear.png' },
      blurb: 'A tactical arena shooter. Squad up for 5v5 online battles, run it back 1v1 in Duels, ' +
        'survive endless Zombies with friends, drop into Battle Royale-lite, or hide in plain sight in Prop Hunt. ' +
        'New seasons drop every week.',
      chips: ['⚔️ 5v5 online', '🧟 Co-op Zombies', '🪂 Battle Royale-lite', '🤝 Duels', '📦 Prop Hunt',
        '🎖️ Weekly seasons', '🎙️ Voice chat', '📱 Phone, iPad & PC'],
    },
    {
      id: 'boltrush',
      name: 'BOLTRUSH',
      short: 'Boltrush',
      path: 'Boltrush/',
      profile: 'Boltrush/Boltrush.mobileconfig',
      icon: 'boltrush-icon.png',
      tag: 'NEW · FREE',
      accent: { bg: 'var(--bolt)', fg: '#15130a' },
      art: { shot: 'boltrush-shot.jpg', title: ['BOLT', 'RUSH'], italic: true },
      blurb: 'An arcade racer built for quick sessions. Race 7 rivals through a neon city, a desert canyon and a ' +
        'snowy mountain pass. Drift for combo points and nitro, grab ⚡ item boxes to shock rivals, launch off ramps, ' +
        'smash cones and win coins to unlock faster cars. Rivals adapt to how you drive, so every race is close. ' +
        'New? The built-in tutorial teaches you everything in two minutes.',
      chips: ['🏁 Race 7 rivals', '⚡ Items + ramps', '💨 Drift combos', '🎓 Tutorial', '☁️ Accounts',
        '⏱️ Time trials', '🚗 4 cars, 8 paints', '🎮 Controller support', '📱 Phone, iPad & PC'],
    },
    {
      id: 'knockout-isles',
      name: 'KNOCKOUT ISLES',
      short: 'Knockout Isles',
      path: 'Knockout-Isles/',
      profile: 'Knockout-Isles/KnockoutIsles.mobileconfig',
      icon: 'ki-icon.png',
      tag: 'BRAND NEW · FREE',
      accent: { bg: '#ff5a5f', fg: '#fff' },
      art: { shot: 'ki-shot.jpg', title: ['KNOCKOUT', 'ISLES'], stacked: true, titleAccent: '#ffc93c' },
      blurb: 'A party brawler for up to <b>20 players</b>. Punch, dash and charge up smashes to knock everyone off ' +
        'floating islands that crumble as the round goes on. The higher someone\'s damage %, the further they fly. ' +
        'Host a room and share the code with friends, or jump into Quick Play against bots.',
      chips: ['👥 Up to 20 players', '🌐 Online rooms', '🤖 Bots', '🏝️ 3 islands', '💣 Crates', '🎩 Hats',
        '🎓 Tutorial', '☁️ Accounts', '🎮 Controller support', '📱 Phone, iPad & PC'],
    },
  ];

  const STATS = [
    ['15+', 'game modes in Ashfall'],
    [String(GAMES.length), 'free games, one account'],
    ['20', 'players in one Knockout Isles brawl'],
    ['$0', 'free to play, forever'],
  ];

  /* ---------- tiny DOM helper ---------- */
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null) continue;
      if (k === 'class') n.className = v;
      else if (k === 'style') Object.assign(n.style, v);
      else if (k === 'html') n.innerHTML = v;
      else n.setAttribute(k, v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid);
    return n;
  }
  const accentStyle = g => (g.accent ? { background: g.accent.bg, color: g.accent.fg } : null);

  /* ---------- game cards ---------- */
  function gameArt(g) {
    const art = el('div', { class: 'art' }, el('span', { class: 'tag', style: accentStyle(g) }, g.tag));
    if (g.art.logo) {
      art.append(el('img', { src: g.art.logo, alt: g.short }));
      return art;
    }
    art.style.background = 'linear-gradient(180deg, rgba(12,13,22,.12), rgba(12,13,22,.72)), url(' + g.art.shot + ') center/cover';
    const [a, b] = g.art.title;
    const title = el('div', { class: 'art-title' + (g.art.italic ? ' italic' : '') + (g.art.stacked ? ' stacked' : '') },
      a, g.art.stacked ? el('br') : null, el('span', { style: { color: g.art.titleAccent || 'var(--bolt)' } }, b));
    art.append(title);
    return art;
  }

  function gameCard(g, i) {
    return el('article', { class: 'game reveal', id: 'game-' + g.id, style: i ? { marginTop: '22px' } : null },
      gameArt(g),
      el('div', { class: 'info' },
        el('h3', null, g.name),
        el('p', { html: g.blurb + (g.id !== 'ashfall' ? ' Your progress saves to the same ☁️ account as every Ninebolt game.' : '') }),
        el('div', { class: 'chips' }, g.chips.map(c => el('span', null, c))),
        el('div', { class: 'btns' },
          el('a', { class: 'btn go', style: accentStyle(g), href: BASE + g.path }, '▶ Play free'),
          el('a', { class: 'btn ghost', href: BASE + g.profile }, '📲 Get the app'))));
  }

  /* ---------- render ---------- */
  function render() {
    const cards = document.getElementById('gameCards');
    if (cards) cards.replaceChildren(...GAMES.map(gameCard));

    const stats = document.getElementById('stats');
    if (stats) stats.replaceChildren(...STATS.map(([b, s]) => el('div', { class: 'stat reveal' }, el('b', null, b), el('span', null, s))));

    const apps = document.getElementById('appBtns');
    if (apps) apps.replaceChildren(...GAMES.map((g, i) => el('a', { class: 'btn ' + (i ? 'go' : 'ghost'), style: accentStyle(g), href: BASE + g.profile },
      el('img', { src: g.icon, alt: '', class: 'app-ico' }), g.short + ' app')));

    const links = document.getElementById('flinks');
    if (links) links.replaceChildren(...GAMES.map(g => el('a', { href: BASE + g.path }, g.short)), el('a', { href: 'https://github.com/Ninebolt-Studios' }, 'GitHub'));

    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ---------- polish: fade cards in as you scroll, highlight the current section in the nav ---------- */
  function animate() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(n => n.classList.add('shown'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(n => io.observe(n));

    const navLinks = [...document.querySelectorAll('nav .links a[href^="#"]')];
    const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  render();
  animate();
  window.NINEBOLT = { GAMES };
})();
