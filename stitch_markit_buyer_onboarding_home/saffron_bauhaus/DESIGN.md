# Design System Strategy: The Warm Bauhaus Ethos

## 1. Overview & Creative North Star: "The Modern Curator"
The Creative North Star for this design system is **The Modern Curator**. We are moving away from the "software" aesthetic and toward a "gallery" experience. By blending the mathematical rigor of the Swiss International Typographic Style with the warm, reductive philosophy of Muji and Dieter Rams, we create a UI that feels engineered yet human.

This system rejects the clutter of modern SaaS. We achieve a premium feel not through decoration, but through **extreme intentionality**. We utilize the 12-column mathematical grid to create "Active Negative Space"—where empty areas are as vital as the content itself. Expect asymmetrical layouts where large typographic elements anchor the eye, balanced by meticulously aligned functional blocks.

## 2. Colors & Tonal Depth
Our palette is a dialogue between the organic (`#F5F0E8` Warm Off-white) and the industrial (`#0D0D0D` Ink Black). 

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. To maintain the Muji-inspired flow, boundaries must be defined through **Background Color Shifts**. Use the `surface-container-low` (`#f8f3eb`) section sitting on a `surface` (`#fef9f1`) background to imply a change in context. 

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine archival paper.
- **Base Layer:** `surface` (#fef9f1) for general background.
- **Content Blocks:** `surface-container-low` (#f8f3eb) for primary content modules.
- **Interactive Elements:** `surface-container-high` (#ece8e0) for elevated interaction zones.
- **The "Glass" Rule:** For floating menus or navigation, use semi-transparent versions of `surface` with a `backdrop-blur` of 20px. This allows the Saffron or Ink Black tones to bleed through, creating a "frosted glass" depth that feels integrated rather than "pasted on."

### Signature Textures
Main CTAs should not be flat. Use a subtle linear gradient from `primary` (`#9a4601`) to `primary_container` (`#e07b39`) at a 135-degree angle. This adds a "visual soul"—a tactile quality reminiscent of high-end printed materials.

## 3. Typography: The Editorial Scale
Typography is our primary architectural tool. We use **Inter** (as the web-standard proxy for Neue Haas Grotesk) to communicate precision.

*   **Display & Headlines:** Use `display-lg` (3.5rem) and `headline-lg` (2rem) with `font-weight: 300` (Light). These should be tracked slightly tight (-0.02em) to mimic premium editorial headlines.
*   **The Signature Label:** Section labels must be `label-sm` (11px/0.6875rem), `font-weight: 500` (Medium), and **ALL CAPS** with a letter-spacing of `0.1rem`. This is the "Rams signature"—a clear, functional marker of intent.
*   **Body:** `body-md` (0.875rem) provides the legibility required for dense information, maintaining a generous line-height to ensure the "Muji" sense of breathability.

## 4. Elevation & Depth: Tonal Layering
In a Bauhaus-inspired system, drop shadows are a crutch. We use **Tonal Layering** to define importance.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift.
*   **Ambient Shadows:** If a floating effect is required (e.g., a modal), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(29, 28, 23, 0.06)`. The shadow color is a tint of our `on_surface` color, never pure grey.
*   **The Ghost Border:** If a boundary is required for accessibility, use a "Ghost Border": the `outline-variant` (`#dcc1b4`) at 15% opacity. It should be felt, not seen.

## 5. Components: Functional Purity

### Buttons (The Tactile Tool)
*   **Primary:** Saffron gradient (`primary` to `primary_container`), `4px` border radius (scale `DEFAULT`), white text.
*   **Secondary:** `surface-container-highest` background with `on_surface` text. No border.
*   **Tertiary:** All-caps `label-md` text with a 1px underline using the `primary` color, offset by 4px.

### Input Fields
*   **Style:** Minimalist underline. No background fill unless in a high-contrast Admin state.
*   **States:** On focus, the 1px bottom border transitions from `outline` to `primary` (Saffron). Helper text uses `label-sm`.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Implementation:** Use vertical white space (Spacing Scale `8` or `1.75rem`) to separate list items. For cards, use a subtle background shift to `surface-container-low`.

### Data Visualization (Admin Accent)
In the Seller/Admin environment (Ink Black background), use **Blue #2563EB** specifically for data-rich elements like sparklines, progress bars, and status indicators. This provides a "cold" functional contrast to the "warm" buyer experience.

## 6. Do’s and Don’ts

### Do:
*   **Use the 8pt Scale religiously.** Every margin, padding, and gap must be a multiple of the spacing tokens (e.g., `2.5` for 0.5rem, `4` for 0.9rem).
*   **Embrace Asymmetry.** Align a headline to the 2nd column and the body text to the 5th column to create dynamic, editorial energy.
*   **Respect the 4px Radius.** This is our maximum "roundness." It softens the grid without making it look "bubbly" or "app-like."

### Don’t:
*   **Never use 100% opaque borders.** They break the "Muji" flow and create visual "noise."
*   **Avoid standard "Grey."** Our neutrals are tinted with warmth (`#fef9f1`). Pure greys will look dead in this system.
*   **No Center Alignment for Text.** Stick to the Swiss tradition: Left-aligned (ragged right) for everything. It is more legible and mathematically honest.