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
- [x] **Fixed category order**: Update build script to sort by fixed category order (basics → starters → salads → mains → sides → desserts → drinks) instead of alphabetical
- [x] **Category validation**: Build fails with a clear error if a recipe uses an invalid category
- [x] **Adaptive card sizing**: Use Puppeteer to measure each card's rendered height and assign a size class (`quarter` ≤ ¼ A4, `half` ≤ ½ A4, `full` = entire page)
- [x] **Page bin-packing**: Pack cards into pages greedily (each page = 4 slots; half = 2 slots, full = 4 slots) so no card is clipped and minimal space is wasted
- [x] **Fix card measurement**: Two-pass measurement — first at quarter-width (97mm), then re-measure overflows at half-width (194mm). Row height is ~140mm (281mm / 2), not 281mm. Cards that don't fit at half-width become full-page.
