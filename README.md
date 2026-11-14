# rileycohn-website-frontend

Static front end for rileycohn.com. No build step: plain HTML, CSS and JS.

- `/` is RileyOS, a pixel desktop (`index.html`, `css/os.css`, `js/os.js`).
- `/games/` is the arcade (`games/index.html`, `css/arcade.css`, `js/arcade.js`).
- Each game is a cartridge in `games/carts/`. To add one, copy a cartridge file,
  change its `id`, and add a `<script>` tag for it in `games/index.html`.
- `js/achievements.js` is shared by both pages and stores progress in localStorage.

Run locally from the repo root (paths are root-relative):

    python3 -m http.server 8000
