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
- Overflow: clipped with a visual indicator, or auto-expand (see open questions)

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

## Design Decisions

- **Long recipes**: Most recipes will be short and fit in ¼ page. If a recipe overflows, it auto-expands to ½ or full page — no clipping.
- **Ordering**: Recipes are grouped by `category` in a fixed logical order (basics → starters → salads → mains → sides → desserts → drinks). Within a category, recipes are sorted alphabetically by filename. Deterministic order so reprints are consistent.
- **Page orientation**: Portrait A4.
- **No index/TOC**: The PDF starts directly with recipe cards.
- **Color scheme**: Black & white text for cheap printing. Emojis retain their native color.
- **No filtering**: The build always includes all recipes.
