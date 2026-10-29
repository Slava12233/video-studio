# Default brand kit (neutral, Hebrew-first)

Used when a project names no client brand. Dark stage, one warm accent, heavy Hebrew display type. Tone: confident,
short sentences, verbs, digits for numbers.

## Colors (`palette.css`)
| Token | Hex | Use |
| --- | --- | --- |
| `--primary` | `#0b1220` | stage background, title cards |
| `--primary-deep` | `#05080f` | gradients with primary, vignettes |
| `--ink` | `#101828` | text on light backgrounds, pills on photos |
| `--accent` | `#ffd60a` | emphasis words in captions, bars, one per scene |
| `--accent-2` | `#2dd4bf` | secondary accent: charts, "yes" states |
| `--cta` | `#ff2e63` | the single call-to-action element, "no" states |
| `--gray` | `#9aa3b2` | secondary caption text, labels |
| `--paper` | `#f7f7f5` | light background |
| `--white` | `#ffffff` | text on dark |

Rules: one accent per scene; captions white on dark or ink on light, emphasis words in `--accent`; never red/green as
the only signal (color-blind safe); nothing important in the bottom 250 px or top 200 px of a 9:16 frame.

## Typography (shared `fonts/`, `fonts.css`)
- **Heebo** (Hebrew + Latin): 400 body, 700 subtitles, 800 captions, 900 titles.
- **Rubik 900**: giant numbers and one-word punches.
- **Inter**: standalone Latin blocks and UI text.
- Local files only (`assets/fonts/`), never Google Fonts at render time. Hebrew blocks `.he`, numbers `.num`,
  English words inside Hebrew lines `.ltr`. Captions 42-56 px on a 1080-wide frame, 2-4 words per cue, two lines max.

## Motion
- Entrances 0.5-0.7 s with `expo.out` / `power3.out`; exits 0.3-0.4 s.
- Cuts on the beat when music exists; otherwise every 2.5-4 s in reels, 4-6 s in films.
- One camera idea per shot (push, slide, Ken Burns). No zoom-and-rotate combos. Snap zooms land on stressed words.

## Logo
Drop `logo.svg` (and `logo-white.svg` for dark stages) in `logo/`. Clear space = logo height on all sides. On photos,
put the logo on an ink or white pill, never straight on a busy image.

## Legal
- AI-generated or AI-edited visuals and AI voices are disclosed (`DISCLOSURE.md`). No exceptions without Slava.
- No private names, phone numbers or exact addresses unless the brief approves them.
- Music and SFX: generated (fal.ai) or licensed only. No commercial tracks.
