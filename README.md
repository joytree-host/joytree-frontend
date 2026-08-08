# JoyTree Frontend (rebuild)

Rebuilding the JoyTree marketing/app frontend page by page — separate HTML/CSS
files instead of one monolithic `index.html`, sharing a single theme system
with [docs.joytree.site](https://docs.joytree.site) so dark/light mode and
visual language are consistent across the whole product.

## Structure

- `theme.css` — shared design tokens (colors, spacing, buttons, nav) — same
  variable names/values as the docs site. Every page links this first.
- `home.css` — home page specific layout (hero, marquee, features, CTA).
- `home.html` — the home page itself.
- `home.js` — theme toggle + mobile menu, same pattern as the docs site.
- `logo.png` / `favicon.png` — brand assets.

## Status

- [x] Home page
- [ ] Sign up
- [ ] Sign in
- [ ] Dashboard shell
- [ ] ... (rest of the app, page by page)

## Deploying

This repo only contains static files — no server. To integrate into the main
`deployboard` app: copy `theme.css`, `home.css`, `home.js`, and the built
HTML into the deployboard repo, replacing the corresponding section of the
current monolithic `index.html`, then `docker compose build && docker
compose up -d` as usual.
