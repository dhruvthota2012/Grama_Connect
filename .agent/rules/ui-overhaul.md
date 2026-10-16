# GramaConnect UI Overhaul v3

The live site now shows the new direction, so the styling pipeline works. What is left: real alignment bugs, old leftovers, and a design that still feels like "cards on a gradient". This pack fixes the bugs from your screenshots and raises the design level.

## Bugs I found in your live screenshots (fix all of them)
1. **Hero text collides with the artwork.** The subtitle and Telugu pill sit on the hills, and the Hindi pill is hidden behind the language bar.
2. **Inconsistent margins.** The header starts at 20px but the hero and cards start at 43px, so nothing lines up. Everything must share one container.
3. **Language tiles are unequal.** Different widths and heights, and "తెలుగు" and "हिन्दी" sit high instead of being vertically centred.
4. **Bottom strip is unreadable.** The stage label ("1/5: Sprout") is dark text on dark brown, the first dot is invisible, and the plant is tiny.
5. **Card arrow buttons cover the descriptions** (tractor card "levellers", transport card "fertilizers, a…").
6. **Titles are still ALL CAPS** ("SELECT THE SERVICE YOU NEED", "PERSON / WORKERS"). A leftover `text-transform: uppercase` is still winning.
7. **Old leftovers:** the left blue bar with a pill under the page title, and the short dark divider line under "What would you like to do?".
8. **Header plus Back/Home bar** stack into two heavy bands, which wastes space.
9. **Cards are identical templates** (gradient, circle icon, text). That is why it feels basic.

## What changes in v3: "Dawn over the village"
- **Cinematic dawn hero.** A deep-blue sky fading to marigold at the horizon, so white headings have strong contrast. A sun rises once on page load, clouds drift, the tractor rolls slowly, crops sway and the hills shift gently with the mouse. Text lives in the dark sky and the artwork lives below it, never overlapping.
- **Illustrated postcard cards.** Each category has its own scene (farmer in paddy, tractor ploughing, harvester in golden field, truck on a road), with text in its own area and the arrow button in its own footer row, so nothing overlaps.
- **One shared container** for header, hero text, language bar and cards.
- **Equal-size language tiles**, centred, with a clear selected state.
- **Readable field strip** with cream text, visible dots and a bigger plant.

## How to use
1. Open `gramaconnect-design-reference-v2.html` in your browser. This is the target.
2. Copy it into your project at `/design-reference/` and replace the old v1 reference.
3. Replace `.agent/rules/ui-overhaul.md` with the rules block below.
4. Run steps 1 to 4 in order, each in a new Antigravity conversation. Commit after each good step.

---

## RULES FILE: `.agent/rules/ui-overhaul.md` (replace the old one)

```markdown
# GramaConnect UI Overhaul v3 Rules

## Scope
Change ONLY appearance, layout, typography, colour, illustration, imagery and motion.
NEVER change logic, state, handlers, routes, data, search, auth/OTP, availability, voice, session
timer, two-tap selection, keyboard shortcuts, translation keys, or print output. Keep handlers,
props and ids identical when restructuring markup. Run the app and `npm run build` after each step.
Never claim a check passed unless you ran it.

## Target
Match /design-reference/gramaconnect-design-reference-v2.html for: dawn hero, shared container,
language bar, illustrated postcard cards, field strip, header pill, typography, shadows and motion.
Extend the SAME language to every screen not shown in it.

## Layout rules (these caused the bugs)
- ONE container class (max-width 1560px, 28px side padding) used by header, hero text, language
  bar, page titles, grids and footers. No screen may use different side margins.
- Text never sits on top of artwork. Text zone and art zone are separate vertical regions.
- Equal-height tiles and cards; content vertically centred with flex/grid, never margin hacks.
- Buttons and badges sit in their own flow row, never position:absolute over text.
- Reserve bottom padding equal to the field strip height so nothing is covered.

## Typography
- Baloo 2 headings, Noto Sans body, Noto Sans Telugu / Devanagari for those scripts.
- Sentence/title case only. Search the whole codebase and DELETE every `text-transform: uppercase`
  and uppercase utility on titles and buttons. Verify no title is all caps in any language.

## Remove leftovers
Delete the left blue bar + pill title block and the short dark divider under page titles.
Replace with a clean page title (Baloo 2, 44px) and one tap-guidance chip. Merge Back and Home
into the main header row on inner pages (Back and Home as icon+label buttons), removing the
second stacked band; keep the kiosk node name as a small chip.

## Palette
blue #174A8B, sky #43B5E8, leaf #279653, crop #176B45, gold #F3C969, cream #FFF9ED, ink #183247,
marigold #FF9F1C, turmeric #E8A91C, clay #C8553D, soil #8A5A3A, deep soil #3B2A1E.
Dawn sky gradient: #0F3466, #174A8B, #43B5E8, #FFD39A, #FF9F1C.
Category colours everywhere: workers green, tractor clay, harvester turmeric, truck blue,
other machinery soil.

## Imagery
- Prefer hand-built inline SVG for illustrations. If this Antigravity setup has image generation,
  you may generate hero or card art, but save as optimised WebP (under 250KB each), add width/
  height and alt text, lazy-load below the fold, and keep an SVG or gradient fallback.
- No stock-photo look, no real people photos, no real brand logos, no fake partner names.
- Illustration style: flat, layered, paper-cut with soft upward shadows, warm palette, rounded.

## Projector rules
Body 18px minimum, card titles 28-34px, page titles 44-68px, contrast at least 7:1 for body text
(4.5:1 absolute minimum), borders 2-3px, state shown by colour blocks. Test 1920x1080, 1366x768,
1280x720, 125% zoom, in English, Telugu and Hindi.

## Motion (orchestrated, not noisy)
- One entrance moment: the sun rises on first load of the welcome screen.
- Ambient but gentle: clouds drift, crops sway, tractor drives slowly. All paused under
  prefers-reduced-motion. No looping animation inside forms or lists.
- Interaction: hover lift 6-8px with growing shadow, arrow nudge, press scale .97, page fade+slide
  250ms, language-tile pop, smooth Active/Inactive colour change.
- Pointer parallax on hero layers only (max 30px). CSS and a few lines of JS only, no libraries.
- Keep 60fps on a laptop: animate transform and opacity only.
```

---

## STEP 1: Fix every bug and rebuild the shell and welcome flow
`[attach your 3 latest screenshots]`

```
Read the v3 rules and open /design-reference/gramaconnect-design-reference-v2.html.
Fix all nine bugs below, then rebuild the header, welcome hero and language screen to match the
reference. Keep every handler and behaviour identical.

BUGS: (1) hero text overlaps artwork and Hindi pill hidden behind the language bar, (2) header and
content use different side margins, (3) language tiles unequal and not vertically centred,
(4) bottom strip label unreadable, first dot invisible, plant tiny, (5) card arrow buttons cover
descriptions, (6) titles still all caps, (7) old blue bar and dark divider leftovers,
(8) header plus Back/Home as two stacked bands, (9) identical cookie-cutter cards.

Do: one shared container; dawn-sky hero with text above and artwork below; sun-rise entrance,
drifting clouds, swaying crops, slow tractor, pointer parallax; floating language bar with three
equal tiles; readable docked field strip. Find and delete the CSS causing the uppercase titles.
Report root causes. Provide before/after screenshots at 1920x1080 and 1366x768 in all three
languages. Run the build and confirm voice, session timer and language selection still work.
```

## STEP 2: Service, work-category and registry pages

```
Apply the v3 rules. Use the postcard card design from the reference for:
- Service-selection page: four postcards (workers, tractor, harvester, truck) with their scene art,
  numbered badge, title, description, key tag and arrow in the footer row.
- Work-category grid (12+ items): same postcard language in a compact form, each with a small
  scene or two-tone icon on a coloured panel. 4 columns at 1920, 3 at 1366.
- Registry hub: two-column horizontal cards with illustration left, text right, arrow button.
Replace the page title block with a clean Baloo 2 title and one guidance chip. Keep the
two-tap behaviour (first tap lifts card, outlines it and shows "Tap again to open") and
keyboard shortcuts working. Before/after screenshots, build, regression check.
```

## STEP 3: Login, OTP and registration forms

```
Apply the v3 rules.
- Login: split-screen. Left: full-height dawn village scene (same language as the hero) with
  "Welcome Back, Farmer!" on a cream panel and three icon benefit rows. Right: cream card, shield
  icon, large +91 field, big Send OTP button, compact rounded keypad that does not dominate.
  Demo account note styled as an intentional "Demo mode" ribbon.
- OTP step: large separate digit boxes, readable resend text, success state with check.
- Registration forms: large inputs, labels above, clay-red inline errors, big consent tile,
  dashed earth-brown photo dropzone with a fixed-ratio preview frame, chips with solid green
  selected state and white text.
Do not change authentication or validation behaviour. Verify login and each form still work.
```

## STEP 4: Dashboard, results, polish and final QA

```
Apply the v3 rules.
- Dashboard: profile card with initials or sprout avatar, status panel (Active = bright green with
  sun icon, Inactive = soil grey with moon icon, smooth transition), readable selected chips,
  save toasts.
- Search results: card per provider with large name and phone number, machinery photo in a fixed
  crop frame with a clearly labelled illustration fallback. Print output must stay unchanged.
- Empty states and confirmations with friendly illustration in the same style.
Then QA and report only what you actually checked: every screen at 1920x1080, 1366x768, 1280x720
and 125% zoom in English, Telugu and Hindi; no overlap or clipping; no all-caps titles; consistent
side margins; contrast; reduced motion; one complete farmer search, registration, login with a
status change, and a print preview; `npm run build`; console errors. Include before/after
screenshots for every screen.
```

---

## If it still looks basic
Reply: *"Open the v2 reference and the live page side by side. List every difference in layout, imagery, type and motion, then fix them all and show a new screenshot."*
