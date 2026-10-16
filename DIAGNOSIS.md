# GramaConnect UI Diagnosis: Why Prior Styling Did Not Show

## Executive Summary
Prior redesign iterations made incremental CSS adjustments layered on top of a 5,200-line legacy stylesheet without addressing root structural causes: fonts were not installed, card components remained white boxes with hairlines, titles were hardcoded uppercase strings, illustrations were flat monochrome silhouettes, and the plant progress widget was fixed as a floating widget obscuring page contents.

---

## Root Causes Identified

### 1. Fonts Were Never Installed (Defaulting to Windows System UI)
- **Problem**: `App.css` specified `--font-kiosk: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`. On Windows, this falls back to generic **Segoe UI**, giving the site a generic corporate admin dashboard appearance.
- **Fix**: Install `@fontsource/baloo-2`, `@fontsource/baloo-tammudu-2`, `@fontsource/noto-sans`, `@fontsource/noto-sans-telugu`, and `@fontsource/noto-sans-devanagari`. Configure headings to use `Baloo 2` / `Baloo Tammudu 2` for warm, rounded, friendly village typography.

### 2. Cards Remained White Boxes with Hairline Borders
- **Problem**: In `App.css`, `.kiosk-menu-card`, `.service-card`, and `.lang-card` all had:
  ```css
  background-color: var(--color-pure-white);
  border: 1.5px solid var(--color-primary-border);
  ```
  On screens and projectors, white-on-white looks pale and empty.
- **Fix**: In the design reference (`gramaconnect-design-reference.html`), primary cards are **solid saturated color blocks** (`linear-gradient(150deg,#2DAA5E,#176B45)` for Green, `linear-gradient(150deg,#2A6CC0,#174A8B)` for Blue), with a kolam dot overlay pattern (`radial-gradient(circle,rgba(255,255,255,.22) 3px,transparent 4px)`), large cream medallions (`width: 150px; height: 150px`), radius 36px, and chunky 10px pressed shadows (`box-shadow: 0 10px 0 rgba(0,0,0,.16), 0 24px 40px rgba(24,50,71,.25)`).

### 3. Shouting All-Caps Titles & Keyboard Pills
- **Problem**: Titles and badges throughout components were hardcoded or styled in all-caps:
  - `PERSON / WORKERS`, `TRACTOR & ATTACHMENTS`, `HARVESTER MACHINES`, `MINI TRUCK TRANSPORT`
  - `[ KEY 1 ]`, `[ KEY 2 ]`, `[ MANDATORY DETAILS ]`, `[ DAILY REGISTRATION ]`
- **Fix**: Switch all headings and card titles to friendly Title Case in Baloo 2. Replace ugly text pills with small circular key badges (`.key` with `width: 44px; height: 44px; border-radius: 50%`).

### 4. Floating Plant Progress Pill Occluded Content
- **Problem**: `.growing-grass-container` was set to:
  ```css
  position: fixed;
  bottom: 12px;
  right: 20px;
  z-index: 99;
  ```
  This placed a floating card directly over form inputs, navigation buttons, and bottom action bars.
- **Fix**: Dock the plant progress widget into a permanent 78px full-width field strip at the viewport bottom (`position: fixed; left: 0; right: 0; bottom: 0; height: 78px; background: linear-gradient(180deg,#6B4630,#3B2A1E); border-top: 6px solid var(--leaf);`), and give the app main wrapper `padding-bottom: 110px` so page content is never hidden.

### 5. Weak, Washed-Out Page Background
- **Problem**: The app wrapper used a faint `#EAF6FC` background with subtle radial gradients that washed out completely on bright displays and projectors.
- **Fix**: Apply the rich dawn-gradient from the design reference:
  ```css
  background: linear-gradient(180deg, #FFD7A0 0%, #FFE8C8 260px, #D6EEF7 620px, #EAF6FC 100%);
  ```

### 6. Flat Monochrome SVG Silhouettes
- **Problem**: `AgriculturalIllustration` rendered flat black/navy silhouettes (`#183247` or `#174A8B`), looking like clinical clipart.
- **Fix**: Use two-tone colored SVGs on cream circular medallions (`.medal`) matching the reference artwork.

### 7. CSS Accumulation & Layering Conflicts
- **Problem**: 5,200+ lines in `App.css` meant newly added classes competed against legacy classes with high specificity and inline styles.
- **Fix**: Restructure shared foundations directly, removing obsolete overriding blocks for header, cards, chips, buttons, and plant container while strictly preserving test-required variable names (`--color-primary`, `--color-sky-blue`, `--color-leaf-green`, etc.) and test invariants.
