#!/usr/bin/env python3
"""Ninebolt release helper.

Bumps the version stamp on every js/ and css/ link in index.html (and Ashfall's in-game
update-check stamp), so players always download the newest game files instead of an old
cached copy. Run it before committing a change to the game:

    python3 tools/release.py
"""
import pathlib
import re
import subprocess
import sys
import time

root = pathlib.Path(__file__).resolve().parent.parent
page = root / 'index.html'
stamp = time.strftime('%Y%m%d%H%M%S', time.gmtime())

# 1. syntax-check every game script with Node (if it's installed)
for js in sorted((root / 'js').glob('*.js')):
    try:
        r = subprocess.run(['node', '--check', str(js)], capture_output=True, text=True)
    except FileNotFoundError:
        break
    if r.returncode:
        sys.exit(f'Syntax error in {js.name}:\n{r.stderr}')

# 2. bump the stamps
html = page.read_text()
html, links = re.subn(r'((?:js|css)/[\w-]+\.(?:js|css))\?v=\d+', r'\1?v=' + stamp, html)
html, checks = re.subn(r"var B='\d+'", f"var B='{stamp}'", html)
page.write_text(html)
print(f'Release stamp {stamp}: updated {links} file link(s)' + (' and the update check' if checks else ''))
