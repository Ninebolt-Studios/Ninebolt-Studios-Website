/* "Latest updates": pulls the newest changes for every game straight from GitHub,
   so this section is always current without anyone editing the website. */
(function () {
  'use strict';

  const ORG = 'Ninebolt-Studios';
  const CACHE_KEY = 'nb-updates-v1';
  const CACHE_MS = 15 * 60 * 1000; // GitHub allows 60 anonymous requests an hour, so cache for 15 minutes
  const PER_GAME = 3;

  const games = () => (window.NINEBOLT && window.NINEBOLT.GAMES) || [];
  const repoOf = g => g.path.replace(/\/$/, '');

  function timeAgo(iso) {
    const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
    const units = [[31536000, 'year'], [2592000, 'month'], [604800, 'week'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
    for (const [sec, name] of units) {
      const n = Math.floor(s / sec);
      if (n >= 1) return n + ' ' + name + (n > 1 ? 's' : '') + ' ago';
    }
    return 'just now';
  }

  // turn a commit message into a friendly one-liner ("v149: Real JavaScript project: ..." -> "Real JavaScript project: ...")
  function tidy(msg) {
    let line = String(msg || '').split('\n')[0].trim();
    line = line.replace(/^v\d+(\.\d+)*\s*:\s*/i, '');
    if (line.length > 110) line = line.slice(0, 107).replace(/\s+\S*$/, '') + '…';
    return line;
  }

  async function fetchGame(g) {
    const r = await fetch(`https://api.github.com/repos/${ORG}/${repoOf(g)}/commits?per_page=${PER_GAME + 4}`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) throw new Error('GitHub ' + r.status);
    const list = await r.json();
    return list
      .filter(c => !/^(merge|readme|website copy)/i.test(c.commit.message))
      .slice(0, PER_GAME)
      .map(c => ({ game: g.id, text: tidy(c.commit.message), at: c.commit.committer.date, url: c.html_url }));
  }

  async function load() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.t < CACHE_MS) return cached.items;
    } catch (e) { /* private mode: no cache */ }
    const results = await Promise.allSettled(games().map(fetchGame));
    const items = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
    if (!items.length) throw new Error('no updates');
    items.sort((a, b) => new Date(b.at) - new Date(a.at));
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), items })); } catch (e) { /* ignore */ }
    return items;
  }

  function render(items) {
    const box = document.getElementById('updList');
    if (!box) return;
    const byId = Object.fromEntries(games().map(g => [g.id, g]));
    box.replaceChildren(...items.slice(0, 8).map(it => {
      const g = byId[it.game];
      const row = document.createElement('a');
      row.className = 'upd-row reveal shown';
      row.href = it.url; row.target = '_blank'; row.rel = 'noopener';
      const ico = document.createElement('img'); ico.src = g.icon; ico.alt = ''; ico.className = 'app-ico';
      const mid = document.createElement('div');
      const name = document.createElement('b'); name.textContent = g.short;
      const text = document.createElement('span'); text.textContent = it.text;
      mid.append(name, text);
      const when = document.createElement('small'); when.textContent = timeAgo(it.at); when.title = new Date(it.at).toLocaleString();
      row.append(ico, mid, when);
      return row;
    }));
  }

  const section = document.getElementById('updates');
  load().then(render).catch(() => { if (section) section.hidden = true; });
})();
