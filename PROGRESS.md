# Progress

## PDF Pipeline (done)

- [x] Project setup, dependencies, sample recipes
- [x] HTML template with CSS print styles (A4, 2×2 grid, dotted cut lines)
- [x] Build script: parse recipes → HTML → PDF via Puppeteer
- [x] Category support with fixed order and validation
- [x] Adaptive card sizing (quarter/half/full) with two-pass measurement
- [x] Page bin-packing (greedy slot filling)

## GitHub Pages Site

- [x] **HTML generation**: Extend build script to output `docs/` with one HTML page per recipe, using a minimal page template that links to `style.css`
- [x] **Index page**: Generate `docs/index.html` listing all recipes grouped by category (same fixed order as PDF), each title linking to its recipe page
- [x] **CSS**: Create `docs/style.css` — minimal, classless, web-only (max-width 640px, system fonts, semantic element styling, emoji-friendly ingredient lists)
- [x] **PDF link**: Include `cookbook.pdf` in `docs/` and link to it from the index page
- [x] **GitHub Action**: Add `.github/workflows/deploy.yml` — on push to `main`: checkout → install → `npm run build` → deploy `docs/` to GitHub Pages

## Recipe Submission via GitHub Issues

- [x] **Add recipe action**: Create `.github/workflows/add-recipe.yml` — on issue opened, run Pi agent to parse the issue, create recipe .md, build, commit, and close issue
