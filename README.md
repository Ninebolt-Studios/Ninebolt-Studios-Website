<p align="center"><img src="ninebolt-logo-clear.png" alt="Ninebolt Studios" width="420"></p>
<h3 align="center">Games with a jolt ⚡</h3>
<p align="center">Free games you can play right in your browser, on iPhone, iPad, Android and PC.</p>

<p align="center"><b>🌐 <a href="https://ninebolt-studios.github.io/Ninebolt-Studios-Website/">ninebolt-studios.github.io/Ninebolt-Studios-Website</a></b></p>

## 🎮 Our games

| | Game | Play | Code |
|---|---|---|---|
| <img src="ashfall-icon.png" width="48"> | **Ashfall**: tactical arena shooter. 5v5 online, Duels, co-op Zombies, Battle Royale-lite, Prop Hunt, weekly seasons | [▶ Play](https://ninebolt-studios.github.io/Ashfall/) | [Repo](https://github.com/Ninebolt-Studios/Ashfall) |
| <img src="ki-icon.png" width="48"> | **Knockout Isles**: 20-player party brawler. Punch and dash rivals off crumbling floating islands, online rooms + bots | [▶ Play](https://ninebolt-studios.github.io/Knockout-Isles/) | [Repo](https://github.com/Ninebolt-Studios/Knockout-Isles) |
| <img src="boltrush-icon.png" width="48"> | **Boltrush**: arcade racer. 7 adaptive rivals, drift combos, ⚡ items, ramps, tutorial | [▶ Play](https://ninebolt-studios.github.io/Boltrush/) | [Repo](https://github.com/Ninebolt-Studios/Boltrush) |

One ☁️ account works in every Ninebolt game.

## 🛠️ About this repo
The studio website, hosted free on GitHub Pages (Settings → Pages → main / root).

- `js/site.js`: builds the game cards, app buttons, stats and footer from one `GAMES` list (add a game = add one entry)
- `js/updates.js`: the **Latest updates** feed, pulled live from each game's GitHub repo
- `js/sparks.js`: the animated lightning + ember background in the hero
- `css/site.css`: all the styling
- `index.html`: the page layout
- `tools/release.py`: Python release helper (checks the JavaScript and bumps version stamps)
