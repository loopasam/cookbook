# Agents — How to Work on This Project

## Workflow

1. **Pick the next unchecked task** from `PROGRESS.md` — work on one task at a time, in order.
2. **TDD red/green cycle:**
   - Write a failing test first (red)
   - Implement the minimum code to make it pass (green)
   - Refactor if needed, keeping tests green
3. **Mark the task as done** in `PROGRESS.md` (`- [x]`) once tests pass and the change is complete.
4. Move to the next task.

## Reference

- `ARCHITECTURE.md` — the bigger picture: system design, search strategy (Layer 1/1b/2), schemas, prompt design, project structure. Consult when you need context on _why_ something is built a certain way.
- `PROGRESS.md` — the task list. Source of truth for _what_ to do next.

## Adding Recipes

When the user asks to add a recipe, create a Markdown file in `recipes/` following this format exactly:

### File naming
- Lowercase, kebab-case: `thai-green-curry.md`, `banana-bread.md`

### Simple recipe
```markdown
---
title: Recipe Name
category: mains
servings: 4
---

## Ingredients
- 🍝 400g spaghetti
- 🥓 200g guanciale
- 🥚 4 egg yolks

## Steps
1. Boil the spaghetti 🍝 in salted water until al dente
2. Crisp the guanciale 🥓 in a pan until golden

## Notes
- Optional tips or variations
```

### Recipe with inline prep
When a recipe requires a sub-component prepared from scratch (e.g., mayo, roasted pumpkin), add a `## Prep: <name>` section before `## Ingredients`. List the prep ingredients and steps inline. Reference the prep result in the main ingredients with a note like "(from prep above)".

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
- 🫙 3 tbsp mayo (from prep above)
...
```

If the same prep is used in multiple recipes, duplicate it in each file — every recipe must be self-contained.

### Rules
- **Frontmatter**: `title` (required), `category` (required), `servings` (required). No other fields.
- **Category**: must be one of the following fixed values: `basics`, `starters`, `salads`, `mains`, `sides`, `desserts`, `drinks`. No other values are allowed — the build will fail. Pick the most appropriate one:
  - `basics` — sauces, dressings, stocks, foundational recipes
  - `starters` — soups, appetizers, small bites
  - `salads` — cold and warm salads
  - `mains` — main dishes (pasta, curry, stew, fish, meat...)
  - `sides` — vegetables, grains, accompaniments, breads
  - `desserts` — sweet things
  - `drinks` — cocktails, smoothies, etc.
- **Emoji markers**: every ingredient gets a unique emoji at the start of its line. Reuse that same emoji next to the ingredient name in the Steps section. Always write the full ingredient name — the emoji is a visual aid, not a replacement.
- **Sections**: `## Prep: <name>` (optional), `## Ingredients` and `## Steps` are required, `## Notes` is optional.
- **Keep it concise**: recipes are printed 4-per-A4-page, so brevity matters. Aim for 5–8 ingredients and 4–6 steps.
- After adding recipes, run `npm run build` to regenerate the PDF.

## Sharing Recipes

When sharing a recipe URL with the user, always link to the **individual recipe page**, not the cookbook root.

**Pattern:** `https://loopasam.github.io/cookbook/<kebab-case-recipe-name>.html`

**Example:**
- Recipe file: `recipes/shaved-asparagus-pizza.md`
- Live URL: `https://loopasam.github.io/cookbook/shaved-asparagus-pizza.html`

Derive the slug from the recipe filename (kebab-case, no `.md` extension).

## Learnings

_Capture gotchas, decisions, and things discovered during implementation here so they aren't lost._

- _(none yet)_
