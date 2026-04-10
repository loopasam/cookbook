# Cookbook 🍳

A personal recipe collection with an automated PDF generator and GitHub Pages site.

## What's here

- **26 recipes** across categories: starters, mains, sides, dressings, soups, desserts
- **PDF output** — `cookbook.pdf` generated from markdown via Puppeteer (A4, 2×2 card grid with cut lines)
- **GitHub Pages site** — live at [loopasam.github.io/cookbook](https://loopasam.github.io/cookbook)
- **Automated deploy** — push to `main` → PDF + site rebuild automatically

## Project structure

```
recipes/          # Recipe markdown files (frontmatter + emoji ingredients)
scripts/
  build-pdf.js   # Parses recipes → generates cookbook.pdf
  build-site.js  # Generates GitHub Pages site in docs/
templates/
  layout.html    # PDF template with CSS print styles
.github/
  workflows/
    deploy.yml        # Push to main → rebuild + deploy
    add-recipe.yml    # Submit a recipe via GitHub Issue
```

## Running locally

```bash
npm install
npm run build        # Builds PDF + site
npm run build:site   # Site only
```

## Adding a recipe

The easiest way is to **open a GitHub Issue** — the `add-recipe` action will parse it, create the markdown file, and open a PR for you.

Or manually: add a `.md` file to `recipes/` with this frontmatter:

```
---
title: Recipe Name
category: starters  # starters | mains | sides | dressings | soups | desserts
servings: 4
---
```

## Categories (fixed order)

starters → mains → sides → dressings → soups → desserts
