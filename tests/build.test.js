import { test, expect } from 'vitest';
import { loadRecipes, renderCard, buildHTML } from '../scripts/build-pdf.js';

test('loadRecipes returns recipes in fixed category order, then alphabetical within category', () => {
  const CATEGORY_ORDER = ['basics', 'starters', 'salads', 'mains', 'sides', 'desserts', 'drinks'];
  const recipes = loadRecipes();
  expect(recipes.length).toBeGreaterThanOrEqual(4);

  // Categories should follow the fixed order
  const categories = recipes.map(r => r.category);
  for (let i = 1; i < categories.length; i++) {
    if (categories[i] !== categories[i - 1]) {
      const prevIdx = CATEGORY_ORDER.indexOf(categories[i - 1]);
      const currIdx = CATEGORY_ORDER.indexOf(categories[i]);
      expect(currIdx, `"${categories[i]}" should come after "${categories[i - 1]}" in fixed order`).toBeGreaterThan(prevIdx);
    }
  }

  // Within each category, filenames should be alphabetical
  const byCategory = {};
  for (const r of recipes) {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r.filename);
  }
  for (const [cat, filenames] of Object.entries(byCategory)) {
    const sorted = [...filenames].sort();
    expect(filenames, `recipes in "${cat}" not sorted`).toEqual(sorted);
  }
});

test('loadRecipes parses frontmatter correctly including category', () => {
  const recipes = loadRecipes();
  const hummus = recipes.find(r => r.filename === 'hummus.md');
  expect(hummus).toBeDefined();
  expect(hummus.title).toBe('Hummus');
  expect(hummus.category).toBe('starters');
  expect(hummus.servings).toBe(4);
  expect(hummus.bodyHtml).toContain('chickpeas');
});

test('renderCard produces a card div with title and servings', () => {
  const recipe = {
    title: 'Test Recipe',
    servings: 2,
    bodyHtml: '<h2>Ingredients</h2><ul><li>🍝 Pasta</li></ul><h2>Steps</h2><ol><li>Cook the pasta 🍝</li></ol>',
  };
  const html = renderCard(recipe);
  expect(html).toContain('class="card"');
  expect(html).toContain('Test Recipe');
  expect(html).toContain('Servings: 2');
  expect(html).toContain('🍝');
});

test('buildHTML produces full HTML with pages and cards', async () => {
  const html = await buildHTML();
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toContain('class="page"');
  expect(html).toContain('class="card');
  const pageCount = (html.match(/class="page"/g) || []).length;
  expect(pageCount).toBeGreaterThanOrEqual(1);
}, 30000);
