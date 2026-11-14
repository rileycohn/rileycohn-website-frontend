# rileycohn-website-frontend

Static front end for rileycohn.com. No build step: plain HTML, CSS and JS.

- `/` is RileyOS, a pixel desktop (`index.html`, `css/os.css`, `js/os.js`).
- `/games/` is the arcade (`games/index.html`, `css/arcade.css`): a shelf of
  cartridges, each a link to a game. To add one, copy a `.cart` link there.
- The games themselves are deployed separately under `/games/<name>/` (for
  example `/games/duel-dle/`) and are not in this repo, so a deploy of this repo
  must never delete those folders.
- `js/achievements.js` is shared by both pages and stores progress in localStorage.

Run locally from the repo root (paths are root-relative):

    python3 -m http.server 8000
