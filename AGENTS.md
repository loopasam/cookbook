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

### Structure
```markdown
---
title: Recipe Name
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

### Rules
- **Frontmatter**: only `title` (required) and `servings` (required). No tags, prep, or cook fields.
- **Emoji markers**: every ingredient gets a unique emoji at the start of its line. Reuse that same emoji next to the ingredient name in the Steps section. Always write the full ingredient name — the emoji is a visual aid, not a replacement.
- **Sections**: `## Ingredients` and `## Steps` are required. `## Notes` is optional.
- **Keep it concise**: recipes are printed 4-per-A4-page, so brevity matters. Aim for 5–8 ingredients and 4–6 steps.
- After adding recipes, run `npm run build` to regenerate the PDF.

## Learnings

_Capture gotchas, decisions, and things discovered during implementation here so they aren't lost._

- _(none yet)_
