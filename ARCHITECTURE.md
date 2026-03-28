# Cookbook Architecture

## Overview

A personal recipe collection stored as Markdown files, with an HTML + CSS print layout pipeline using Puppeteer to generate printable PDFs with 4 recipe cards per A4 page.

## Folder Structure

```
cookbook/
├── recipes/                # One markdown file per recipe
│   ├── pasta-carbonara.md
│   ├── thai-green-curry.md
│   ├── banana-bread.md
│   └── ...
├── templates/
│   └── layout.html         # HTML template with CSS print styles
├── output/
│   └── cookbook.pdf         # Generated printable PDF
├── scripts/
│   └── build-pdf.js        # Build script: collects recipes → HTML → PDF
├── package.json
├── ARCHITECTURE.md
└── README.md
```

## Recipe Format

Each recipe is a standalone Markdown file with YAML frontmatter:

### Simple recipe

```markdown
---
title: Pasta Carbonara
category: mains
servings: 4
---

## Ingredients
- 🍝 400g spaghetti
- 🥓 200g guanciale
- 🥚 4 egg yolks
- 🧀 100g pecorino romano
- 🌶️ Black pepper

## Steps
1. Boil the spaghetti 🍝 in salted water until al dente
2. Crisp the guanciale 🥓 in a pan until golden
3. Mix the egg yolks 🥚 with pecorino 🧀 and black pepper 🌶️ in a bowl
4. Toss the drained spaghetti 🍝 with guanciale 🥓, then the egg 🥚 and pecorino 🧀 mixture off heat

## Notes
- Use pecorino, not parmesan
```

### Recipe with inline prep

Some recipes require a sub-component to be prepared first (e.g., mayo for a caesar salad, roasted pumpkin for a salad). In that case, add a `## Prep` section before `## Ingredients`:

```markdown
---
title: Caesar Salad
category: salads
servings: 2
---

## Prep: Mayo
- 🥚 1 egg yolk
- 🫗 200ml sunflower oil
- 🍋 1 tsp lemon juice

1. Whisk the egg yolk 🥚 with lemon juice 🍋
2. Slowly drizzle in the oil 🫗 while whisking until emulsified

## Ingredients
- 🥬 1 romaine lettuce
- 🧀 50g parmesan
- 🍞 2 slices bread (for croutons)
- 🫙 3 tbsp mayo (from prep above)
- 🐟 2 anchovy fillets

## Steps
1. Tear the lettuce 🥬 into pieces
2. Cube the bread 🍞 and toast until golden
3. Mix the mayo 🫙 with crushed anchovies 🐟 and grated parmesan 🧀
4. Toss the lettuce 🥬 with the dressing and top with croutons 🍞 and parmesan 🧀
```

The prep section is self-contained within the recipe — no cross-file references. If the same prep (e.g., mayo) is used in multiple recipes, it is duplicated in each. This keeps every recipe card standalone and printable on its own.

### Emoji markers

The emoji acts as a **visual marker** next to the ingredient name — both in the list and in the steps. The full ingredient name is always written out; the emoji just helps your eye quickly track it across the recipe.

### Conventions

- File names: lowercase, kebab-case (e.g. `banana-bread.md`)
- Keep recipes concise — they must fit in ¼ of an A4 page
- Each ingredient gets a unique emoji prefix — reuse that emoji in Steps to link them visually
- Sections: `## Prep: <name>` (optional), `## Ingredients`, `## Steps`, `## Notes` (optional)
- Frontmatter fields: `title` (required), `category` (required), `servings` (required)

### Categories

The `category` field must be one of the following fixed values, listed here in their rendering order in the PDF:

| Order | Category | What belongs here |
|-------|----------|-------------------|
| 1 | `basics` | Sauces, dressings, stocks, foundational recipes |
| 2 | `starters` | Soups, appetizers, small bites |
| 3 | `salads` | Cold and warm salads |
| 4 | `mains` | Main dishes (pasta, curry, stew, fish, meat...) |
| 5 | `sides` | Vegetables, grains, accompaniments, breads |
| 6 | `desserts` | Sweet things |
| 7 | `drinks` | Cocktails, smoothies, etc. |

This order mirrors a natural meal progression: foundational recipes first (things other recipes may reference), then starters → mains → sides → desserts → drinks.

The build script **will fail with an error** if a recipe uses a category not in this list, and will print the valid options.

## Printing Pipeline: Markdown → HTML → CSS Print Layout → PDF

### Approach

1. **Collect** all `recipes/*.md` files
2. **Parse** each recipe: extract YAML frontmatter + convert Markdown body to HTML (using `markdown-it` or `marked` + `gray-matter`)
3. **Render** into an HTML page using a template that arranges recipes in a 2×2 CSS grid per A4 page
4. **Print to PDF** via Puppeteer (headless Chrome) with `@media print` / `@page` CSS rules

### CSS Layout

- A4 portrait page (`@page { size: A4 }`)
- 2×2 grid per page using CSS Grid (`grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr`)
- Each card is a self-contained block containing:
  - **Title** (bold, larger font)
  - **Servings** line
  - **Ingredients** (compact list with emoji markers)
  - **Steps** (numbered list)
  - **Notes** (italic, smaller font, if present)
- Dotted border between cards as cut guides
- Font size: ~8pt body, ~10pt title
- `break-inside: avoid` on cards to prevent splitting across pages
- **Adaptive card sizing**: recipes are measured after rendering to determine how much space they need. A4 portrait with 8mm margins gives 281mm usable height → each grid row is ~140mm tall.
  - **Quarter** (default): fits in one grid cell (97mm wide × 140mm tall)
  - **Half**: too tall at quarter-width, but fits in one row at full width (194mm wide × 140mm tall)
  - **Full**: too tall even at full width — takes an entire page (194mm wide × 281mm tall)
- The build script uses Puppeteer to measure each card's rendered height in two passes:
  1. Measure all cards at **quarter-width** (97mm). Cards that fit in ≤140mm are `quarter`.
  2. Re-measure remaining cards at **half-width** (194mm) — content reflows into the wider space. Cards that now fit in ≤140mm are `half`. The rest are `full`.
- Cards are packed into pages greedily: each page has 4 slots (2×2); a half card uses 2 slots, a full card uses 4 slots. No card is ever clipped.

### Dependencies

- **Node.js** — runtime
- **markdown-it** (or marked) — Markdown to HTML
- **gray-matter** — YAML frontmatter parsing
- **puppeteer** — headless Chrome for PDF generation

### Build Command

```bash
npm run build                     # Generates output/cookbook.pdf
npm run build -- --filter curry    # (future) Filter by filename/title
```

## GitHub Pages Site

### Overview

In addition to the PDF, the build generates a static HTML site published to GitHub Pages. Each recipe becomes its own page, plus an index page listing all recipes grouped by category.

### Output Structure

```
docs/
├── index.html              # Recipe listing grouped by category
├── pesto-beans.html        # One page per recipe (filename matches recipe slug)
├── pasta-carbonara.html
├── ...
├── style.css               # Single shared stylesheet
└── cookbook.pdf             # Link from the site for the printable version
```

### HTML Generation

The existing build script is extended with a second output target. For each recipe it already parses (frontmatter + markdown → HTML), it also:

1. Wraps the recipe HTML in a minimal page template that links to `style.css`
2. Writes it to `docs/<slug>.html`

The index page groups recipes by category (same fixed order as the PDF: basics → starters → salads → mains → sides → desserts → drinks), with each title linking to its recipe page.

### CSS (`docs/style.css`)

A single, minimal CSS file — no framework, no build step. Goals:

- **Readable on any device** — fluid layout, sensible max-width (~640px centered), system font stack
- **Respects the recipe structure** — clear visual hierarchy for title, servings, ingredients, steps, notes
- **Lightweight** — under 2KB, no classes needed on recipe content (style via semantic elements: `h1`, `h2`, `ul`, `ol`, `p`, etc.)
- **Web only** — no print styles needed; the PDF covers the printable use case

Rough plan:

```
body          → max-width: 640px, margin: auto, system fonts, comfortable line-height
h1            → recipe title
h2            → section headers (Ingredients, Steps, etc.)
ul            → ingredient lists (no bullet, since emoji serves as marker)
ol            → steps
.recipe-meta  → servings line, subtle/smaller text
a             → simple link color, no underline clutter on index page
```

### GitHub Action

A GitHub Action runs on every push to `main`:

1. Checks out the repo
2. Installs Node dependencies
3. Runs `npm run build` (generates both PDF and HTML site into `docs/`)
4. Deploys `docs/` to GitHub Pages (using `actions/deploy-pages` or simply committing to a `gh-pages` branch)

This means contributors just push recipe markdown — the site and PDF update automatically.

### What this does NOT include (intentionally)

- No client-side JavaScript (pure static HTML + CSS)
- No search/filter (keep it simple; the index page is scannable)
- No RSS, no API, no JSON feed
- No separate static site generator — the existing build script does everything

## Recipe Submission via GitHub Issues

### Overview

Anyone can submit a recipe by opening a GitHub Issue on the repo. A Pi coding agent automatically processes the issue, converts it into a properly formatted recipe markdown file, commits it to `main`, and closes the issue.

### Flow

```
User opens Issue  →  Action triggers  →  Pi agent reads issue body
(paste recipe)       (on: issues opened)   ↓
                                          Creates recipes/<slug>.md (following AGENTS.md conventions)
                                          Runs npm run build
                                          Commits & pushes to main
                                          Closes issue with comment
                                            ↓
                                          Deploy action triggers (on push to main)
                                          Site + PDF updated
```

### GitHub Action (`.github/workflows/add-recipe.yml`)

- **Trigger**: `on: issues: types: [opened]` — no label filter, fires on every new issue
- **Model**: Anthropic `claude-opus-4-6` via `ANTHROPIC_API_KEY` repo secret
- **Agent prompt**: Inline in the workflow. Instructs pi to:
  1. Read the issue title and body
  2. Determine if it's a recipe — if not, comment on the issue explaining why and stop
  3. If it is a recipe, create the markdown file in `recipes/` following AGENTS.md format rules
  4. Run `npm run build` to regenerate the PDF and site
  5. Commit and push to `main`
- **After agent completes**: A final step closes the issue with a comment linking to the new recipe on the site
- **Non-recipe issues**: The agent comments that the issue doesn't look like a recipe and does NOT close the issue (leave it for a human)

### Secrets Required

- `ANTHROPIC_API_KEY` — for the Pi coding agent to call Claude

## Design Decisions

- **Long recipes**: Most recipes will be short and fit in ¼ page. Longer recipes (e.g., those with a Prep section) auto-expand to ½ page (full row) or full page. The build script measures each card's rendered height via Puppeteer in two passes — first at quarter-width (97mm), then at half-width (194mm) for cards that overflow — and assigns a size class (`quarter` / `half` / `full`). Cards are then bin-packed into pages so no space is wasted and nothing is clipped.
- **Ordering**: Recipes are grouped by `category` in a fixed logical order (basics → starters → salads → mains → sides → desserts → drinks). Within a category, recipes are sorted alphabetically by filename. Deterministic order so reprints are consistent.
- **Page orientation**: Portrait A4.
- **No index/TOC**: The PDF starts directly with recipe cards.
- **Color scheme**: Black & white text for cheap printing. Emojis retain their native color.
- **No filtering**: The build always includes all recipes.
