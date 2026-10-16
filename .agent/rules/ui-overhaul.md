# GramaConnect UI Overhaul Rules

## Scope
Change ONLY appearance, layout, typography, colour, illustration and motion.
NEVER change logic, state, handlers, routes, data, search, auth/OTP, availability, voice,
session timer, two-tap selection, keyboard shortcuts, translation keys, or print output.
Keep all handlers, props and ids identical when restructuring markup.
Run the app and `npm run build` after every step. Never claim a check passed unless you ran it.

## Target: match /design-reference/gramaconnect-design-reference.html
That file is the visual source of truth for: the floating glass header pill, the paper-cut
layered hero with sun rings, the language tile bar overlapping the hero edge, the solid colour
choice cards with kolam dot pattern and medallions, the docked field strip, typography, and the
"pressed" shadow style. Reproduce its look in the real React components. Reuse its CSS
variables and SVG shapes. Where a screen is not in the reference, extend the SAME language.

## Non-negotiable acceptance test (the "visibly different" rule)
For every screen you restyle, take a BEFORE and AFTER screenshot at 1920x1080 using the
browser agent. The AFTER must clearly differ in at least: header, background, typography,
card style, icons, and button style. If a reviewer would say "that looks like the same page",
you have FAILED. Fix it before reporting.

## Find out why styling fails before adding more
Before writing new CSS, inspect why earlier changes did not show: CSS specificity, inline styles,
duplicate or unimported stylesheets, CSS modules, !important rules, fonts not loaded. Report
the cause. DELETE obsolete CSS rules rather than layering over them. Do not add !important
unless there is no other way, and say where you used it.

## Design language
- Sky: dawn gradient #FFD7A0 -> #FFE8C8 -> #D6EEF7 -> #EAF6FC. Never plain white pages.
- Paper-cut layers: stacked wave shapes in teal-green, leaf green, crop green, golden paddy and
  soil, each with a soft upward drop shadow. Used for hero, section dividers and footers.
- Palette: blue #174A8B, sky #43B5E8, leaf #279653, crop #176B45, gold #F3C969, cream #FFF9ED,
  marigold #FF9F1C, turmeric #E8A91C, clay #C8553D, soil #8A5A3A, deep soil #3B2A1E, ink #183247.
- Category colours everywhere: workers = leaf green, tractor = clay red, harvester = turmeric,
  mini-truck = blue, other machinery = soil brown.
- Cards: SOLID saturated colour (not white-with-border) for primary choices, with a faint
  kolam dot pattern, large cream medallion holding a two-tone coloured SVG icon, radius 36px,
  "pressed" shadow (0 10px 0 rgba(0,0,0,.16) plus a soft blur). Secondary cards: cream with a
  3px white border and the same pressed shadow.
- Buttons: pill shape, 48-56px tall, 2px border, pressed shadow on hover, scale .97 on press.
  Primary = deep blue, white text. No heavy black outlines anywhere.
- Header: floating glass pill (blurred cream), circular green sprout logo, timer as a circular
  progress ring showing the same countdown value.
- Plant progress: docked full-width strip at the very bottom (soil-brown with leaf-green top
  border), with page content padded so nothing is ever covered. Keep its stage logic untouched.
- Type: Baloo 2 headings (Baloo Tammudu 2 for Telugu), Noto Sans body, NO all-caps titles.
  Install via @fontsource. Verify Telugu and Hindi render without clipped glyphs.
- Icons: replace black silhouettes with two-tone coloured inline SVG on cream medallions.
- Remove the "[ KEY n ]" pills; show the number as a small round badge. Shortcuts still work.

## Projector rules
Body 18px minimum, card titles 28-42px, page titles 44-64px, text contrast 7:1 (4.5:1 absolute
minimum), borders 2-3px, state shown by colour blocks not faint tints. Test 1920x1080,
1366x768, 1280x720 and 125% zoom, in English, Telugu and Hindi.

## Motion
Smooth and purposeful, not constant: card hover lift with shadow growth (180-220ms), press
scale, page transition fade+slide (250ms), selected state colour changes, arrow nudge on card
hover, language-tile selection pop. No looping animation except existing plant growth.
Respect prefers-reduced-motion. CSS only, no animation library.
