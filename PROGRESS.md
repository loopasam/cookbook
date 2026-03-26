# Progress

## Tasks

- [x] **Project setup**: Initialize `package.json`, install dependencies (`markdown-it`, `gray-matter`, `puppeteer`)
- [x] **Sample recipes**: Create 4–5 example recipes in `recipes/` following the format conventions (frontmatter, emoji ingredients, steps with emoji references)
- [x] **HTML template**: Create `templates/layout.html` with CSS print styles — A4 portrait, 2×2 grid, dotted cut lines, black & white with color emojis
- [x] **Build script**: Create `scripts/build-pdf.js` that:
  - Reads all `recipes/*.md` sorted alphabetically
  - Parses frontmatter + Markdown → HTML
  - Injects recipe cards into the HTML template
  - Handles long recipes (auto-expand to ½ or full page)
- [x] **PDF generation**: Use Puppeteer to render the HTML and print to `output/cookbook.pdf`
- [x] **Add npm script**: `npm run build` wired to the build script
- [x] **Test & tune**: Print a test PDF, verify layout, adjust font sizes / spacing / card fit
- [x] **Category support**: Add `category` to existing recipes, update build script to group by category (alphabetical), update tests
