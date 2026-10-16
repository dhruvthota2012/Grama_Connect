# GramaConnect UI/UX Redesign Rules

## The one big rule: UI ONLY
Change appearance, layout, spacing, typography, colour, illustration and motion.
DO NOT change: business logic, state, hooks, event handlers, routes, data models, search
and matching, authentication/OTP, availability and expiry rules, voice engine, translation
keys or their meaning, session timer logic, two-tap selection logic, keyboard shortcuts,
print output. If markup must be restructured, keep every handler, prop, id and data flow
identical. After every phase, run the app and confirm every existing flow still works,
and run `npm run build`. Never report a check as passed unless you ran it.
The print stylesheet/print component must stay exactly as it is; confirm printing is unaffected.

## Design concept: "A village morning"
Warm sunrise sky above, layered green hills, golden paddy, brown earth below. The app should
feel like a hand-painted village signboard crossed with a clean modern kiosk: friendly,
trustworthy, sunlit. Not corporate, not a government form.

## Palette (CSS variables; keep existing names, add the new ones)
Deep blue #174A8B | Sky blue #43B5E8 | Pale sky #EAF6FC | Leaf green #279653
Crop green #176B45 | Soft green #DDF3DF | Harvest gold #F3C969 | Cream #FFF9ED
Dark text #183247 | White #FFFFFF
New earth tones: Soil brown #8A5A3A | Deep soil #3B2A1E | Clay red #C8553D
Turmeric #E8A91C | Paddy tint #F2F7E4
Category colours (used consistently everywhere):
Workers = leaf green | Tractor = clay red | Harvester = turmeric | Mini-truck = sky/deep blue
| Other machinery = soil brown.
Gold/turmeric are for fills and accents only, never for text on white.

## Projector-ready legibility (the jury watches on a big screen or projector)
- Body text at least 18px, secondary text at least 16px, card titles 24-28px, page titles 36-48px.
- Text contrast at least 7:1 for body, 4.5:1 minimum anywhere. No pale-on-pale, no light grey text.
- Borders 2px in a mid-tone colour, not hairlines. Projectors wash out faint lines and pastels.
- Use bold colour blocks and clear shapes; avoid subtle tints as the only way to show state.
- Test at 1920x1080, 1366x768 and 1280x720, and at 125% browser zoom. Nothing clipped or overlapping.

## Typography
- Headings: friendly rounded sans (Baloo 2, with Baloo Tammudu 2 for Telugu), sentence/title
  case. NO all-caps titles, NO shouting.
- Body: Noto Sans + Noto Sans Telugu + Noto Sans Devanagari.
- Install fonts through @fontsource packages (offline-safe for projector Wi-Fi). Verify Telugu
  and Hindi render with no broken glyphs, no clipping, correct line height.

## Components language
- Cards: warm white or cream, 2px soft-earth border, radius 20px, gentle shadow, colour band
  or accent edge in the category colour. Optional subtle paper/jute texture via CSS only.
- Buttons: pill or rounded 14px, minimum height 52px. Primary = deep blue with white text,
  secondary = cream with deep-blue border, destructive = clay red. No heavy black outlines.
- Chips: selected = solid crop green with WHITE text and a check icon; unselected = white with
  green border and dark text. Selected text must always be readable.
- Inputs: large (56px), 2px border, clear focus ring in sky blue + deep blue.
- Icons: replace flat black silhouettes with two-tone coloured illustrations (inline SVG) on
  round or soft medallions in the category colour. Consistent stroke and size.
- Decorative dividers: a thin wavy paddy-field or hill-line SVG between sections.
- Remove the `[ KEY n ]` pill look. Keep keyboard shortcuts working; show the number as a
  small round badge only.

## Motion (subtle polish only)
- Hover: lift 3-4px with softer shadow, 180ms ease-out. Press: scale 0.98.
- Page change: fade + 12px slide, 250ms. Selected-state colour changes transition 200ms.
- Toggle/status changes animate colour smoothly. Focus rings fade in.
- No looping decorative animations. No parallax. No bouncing.
- Respect `prefers-reduced-motion` (disable transforms, keep opacity fades only).
- CSS only. Do not add an animation library.

## Do not
- Do not add dependencies except @fontsource fonts (and say so).
- Do not rename translation keys, change copy meaning, or hardcode strings in components.
- Do not touch matching, auth, availability, voice, session or print logic.
- Do not use random colours, heavy gradients, or emojis as icons.
