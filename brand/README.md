# Brands

One folder per client. `tools/new-video.mjs --brand <folder>` copies the folder's `palette.css` into the
project's `assets/hebrew.css` (replacing the `/* @palette */` marker), its `logo/*.svg|png` into `assets/`, and
the shared fonts from `_default/fonts/`. The brief records `Brand: <folder>`; `tools/deliver.mjs` reads it to pick
the disclosure label texts (`<brand>/DISCLOSURE.md`, falling back to `_default/DISCLOSURE.md`).

| Folder | What |
| --- | --- |
| `_default/` | the neutral Hebrew kit: fonts, base palette, the disclosure rule and label texts, motion defaults |

Every `palette.css` defines the same token names so compositions port between brands:
`--primary`, `--primary-deep`, `--ink`, `--accent`, `--accent-2`, `--cta`, `--gray`, `--paper`, `--white`,
plus `--bg-dark` and `--bg-light`. A brand may add more tokens; it may not rename these.

Adding a client: copy `_default/` to `brand/<client>/`, edit `BRAND.md` and `palette.css`, drop the logo files in
`logo/`, delete the copied `fonts/` folder and `fonts.css` (fonts are shared from `_default`), and keep
`DISCLOSURE.md` only if the client needs different label wording (Slava approves the wording). Use the same `.he` /
`.ltr` / `.num` / `.caption` / `.ai-badge` classes from `templates/project-base/hebrew.css` in every brand.
