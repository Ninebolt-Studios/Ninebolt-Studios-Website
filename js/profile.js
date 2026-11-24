/* Ninebolt profile + leaderboards.
   Uses the same account as every Ninebolt game. Because the games and this site share
   ninebolt-studios.github.io, if you're signed in to any game you're signed in here too. */
(function () {
  'use strict';

  const FB_CFG = { apiKey: 'AIzaSyAptGcd7k_mjVwkZPdnMLgR-4KPABtBOPU', authDomain: 'dustline-8da4d.firebaseapp.com', projectId: 'dustline-8da4d', storageBucket: 'dustline-8da4d.firebasestorage.app', messagingSenderId: '288529644668', appId: '1:288529644668:web:edb5d96554bc6d647eddf9' };
  const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';

  // one leaderboard per game: which collection, which number ranks it, and how to label it
  const BOARDS = [
    { id: 'ashfall', name: 'Ashfall', icon: 'ashfall-icon.png', col: 'leaderboard', by: 'kills', label: 'eliminations', extra: d => (d.wins || 0) + ' wins' },
    { id: 'boltrush', name: 'Boltrush', icon: 'boltrush-icon.png', col: 'lb_br', by: 'wins', label: 'race wins', extra: d => (d.cars || 0) + ' cars' },
    { id: 'knockout-isles', name: 'Knockout Isles', icon: 'ki-icon.png', col: 'lb_ki', by: 'wins', label: 'wins', extra: d => (d.kos || 0) + ' KOs' },
    { id: 'four-square', name: 'Four Square Smash', icon: 'fs-icon.png', col: 'lb_fs', by: 'wins', label: 'wins', extra: d => (d.king || 0) + ' rallies as King' },
  ];

  const $ = id => document.getElementById(id);
  const root = $('profileRoot');
  if (!root) return;
  let auth = null, db = null, user = null, board = BOARDS[0];

  const loadJs = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = n => (+n || 0).toLocaleString();

  /* ---------- your profile ---------- */
  function renderSignedOut(msg) {
    $('profCard').innerHTML = `
      <div class="prof-out">
        <h3>Sign in to see your Ninebolt profile</h3>
        <p>Use the account from any Ninebolt game (Ashfall, Boltrush, Knockout Isles or Four Square Smash).</p>
        <form id="profForm" class="prof-form">
          <input id="profEmail" type="email" placeholder="Email" autocomplete="email" required>
          <input id="profPass" type="password" placeholder="Password" autocomplete="current-password" required>
          <button class="btn go" type="submit">Sign in</button>
        </form>
        <p class="prof-msg" id="profMsg">${esc(msg || '')}</p>
      </div>`;
    $('profForm').onsubmit = async e => {
      e.preventDefault(); $('profMsg').textContent = 'Signing in…';
      try { await auth.signInWithEmailAndPassword($('profEmail').value.trim(), $('profPass').value); }
      catch (err) { $('profMsg').textContent = /invalid|wrong|not-found/.test(err.code || '') ? 'Wrong email or password. No account yet? Make one in any of our games.' : 'Could not sign in. Try again.'; }
    };
  }

  function decodeAshfall(code) { try { return JSON.parse(decodeURIComponent(escape(atob(String(code).slice(4))))); } catch (e) { return null; } }

  async function renderProfile() {
    $('profCard').innerHTML = '<div class="prof-loading">Loading your profile…</div>';
    let save = {}, ash = {};
    try { const d = await db.collection('saves').doc(user.uid).get(); save = d.exists ? d.data() : {}; } catch (e) { /* no save yet */ }
    try { const d = await db.collection('leaderboard').doc(user.uid).get(); ash = d.exists ? d.data() : {}; } catch (e) { /* not on the board yet */ }
    const ashSave = decodeAshfall(save.code) || {}, career = ashSave.career || {};
    const br = save.br || {}, ki = save.ki || {}, fs = save.fs || {};
    const name = ash.name || ashSave.name || 'Player';
    const achievements = ['br', 'ki', 'fs'].reduce((n, k) => n + Object.keys((save[k] || {}).ach || {}).length, 0);
    const totalWins = (+ash.wins || +career.wins || 0) + (+br.wins || 0) + (+ki.wins || 0) + (+fs.wins || 0);
    const tiles = [
      { icon: 'ashfall-icon.png', game: 'Ashfall', a: num(ash.kills || career.kills), al: 'eliminations', b: num(ash.wins || career.wins), bl: 'wins' },
      { icon: 'boltrush-icon.png', game: 'Boltrush', a: num(br.wins), al: 'race wins', b: num((br.cars || []).length), bl: 'cars owned' },
      { icon: 'ki-icon.png', game: 'Knockout Isles', a: num(ki.wins), al: 'wins', b: num(ki.kos), bl: 'knockouts' },
      { icon: 'fs-icon.png', game: 'Four Square Smash', a: num(fs.wins), al: 'wins', b: num(fs.games), bl: 'matches' },
    ];
    $('profCard').innerHTML = `
      <div class="prof-head">
        <div class="prof-ava">${esc(name.slice(0, 1).toUpperCase())}</div>
        <div><h3>${esc(name)}</h3><p>Ninebolt player · <b>${num(totalWins)}</b> total wins · <b>${num(achievements)}</b> achievements</p></div>
        <button class="btn ghost prof-out-btn" id="profOut" type="button">Sign out</button>
      </div>
      <div class="prof-tiles">${tiles.map(t => `
        <div class="prof-tile"><div class="pt-top"><img src="${t.icon}" alt="" class="app-ico"><b>${t.game}</b></div>
          <div class="pt-nums"><div><strong>${t.a}</strong><span>${t.al}</span></div><div><strong>${t.b}</strong><span>${t.bl}</span></div></div></div>`).join('')}
      </div>`;
    $('profOut').onclick = () => auth.signOut();
  }

  /* ---------- leaderboards ---------- */
  function renderTabs() {
    $('lbTabs').innerHTML = BOARDS.map(b => `<button type="button" class="lb-tab${b === board ? ' on' : ''}" data-id="${b.id}"><img src="${b.icon}" alt="" class="app-ico">${b.name}</button>`).join('');
    $('lbTabs').querySelectorAll('button').forEach(el => { el.onclick = () => { board = BOARDS.find(b => b.id === el.dataset.id); renderTabs(); loadBoard(); }; });
  }
  async function loadBoard() {
    const list = $('lbList'); list.innerHTML = '<div class="lb-row skel"></div>'.repeat(5);
    try {
      const snap = await db.collection(board.col).orderBy(board.by, 'desc').limit(10).get();
      const rows = snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(r => (+r[board.by] || 0) > 0);
      if (!rows.length) { list.innerHTML = `<p class="lb-empty">No one on the ${esc(board.name)} board yet. Sign in to the game and play a match to be the first!</p>`; return; }
      list.innerHTML = rows.map((r, i) => `
        <div class="lb-row${user && r.uid === user.uid ? ' me' : ''}">
          <span class="lb-rank">${['🥇', '🥈', '🥉'][i] || i + 1}</span>
          <span class="lb-name">${esc(String(r.name || 'Player').slice(0, 16))}${user && r.uid === user.uid ? ' <em>(you)</em>' : ''}</span>
          <span class="lb-extra">${esc(board.extra(r))}</span>
          <span class="lb-score">${num(r[board.by])} <small>${esc(board.label)}</small></span>
        </div>`).join('');
    } catch (e) { list.innerHTML = '<p class="lb-empty">Could not load the leaderboard right now. Try again in a bit.</p>'; }
  }

  async function start() {
    renderTabs();
    try {
      await loadJs(FB + 'firebase-app-compat.js');
      await Promise.all([loadJs(FB + 'firebase-auth-compat.js'), loadJs(FB + 'firebase-firestore-compat.js')]);
      if (!(firebase.apps && firebase.apps.length)) firebase.initializeApp(FB_CFG);
      auth = firebase.auth(); db = firebase.firestore();
    } catch (e) { $('profCard').innerHTML = '<p class="lb-empty">Profiles need an internet connection.</p>'; $('lbList').innerHTML = ''; return; }
    auth.onAuthStateChanged(u => { user = u || null; if (user) renderProfile(); else renderSignedOut(); loadBoard(); });
  }
  // only load Firebase when the section is about to be seen (keeps the page fast)
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '400px' }); io.observe(root); }
  else start();
})();
