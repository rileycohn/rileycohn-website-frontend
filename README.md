# rileycohn-website-frontend

Static front end for rileycohn.com. No build step: plain HTML, CSS and JS.

- `/` is RileyOS (`index.html`, `css/os.css`, `js/os.js`): a pixel desktop on wide
  screens and a phone-style home screen with full-screen apps below 720px.
- `/games/` is the arcade (`games/index.html`, `css/arcade.css`): a shelf of
  cartridges, each a link to a game. To add one, copy a `.cart` link there.
- `/projects/` is the workshop (`projects/index.html`, `css/workshop.css`): each
  project is a blueprint sheet. To add one, copy a `.sheet` link there.
  A sheet can open a project page at `/projects/<name>/`. Each project page is
  styled to match that project (see `projects/pupprs/`).
- The games themselves are deployed separately under `/games/<name>/` (for
  example `/games/duel-dle/`) and are not in this repo, so a deploy of this repo
  must never delete those folders.

Run locally from the repo root (paths are root-relative):

    python3 -m http.server 8000

Deploy (needs AWS credentials that can write the site bucket and invalidate
CloudFront). Uploads only, never deletes, so separately deployed games stay put:

    scripts/deploy.sh --dry-run   # show what would change
    scripts/deploy.sh
