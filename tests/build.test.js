import { test, expect } from 'vitest';
import { loadRecipes, renderCard, buildHTML } from '../scripts/build-pdf.js';

test('loadRecipes returns recipes sorted alphabetically by filename', () => {
  const recipes = loadRecipes();
  expect(recipes.length).toBeGreaterThanOrEqual(4);
  const filenames = recipes.map(r => r.filename);
  const sorted = [...filenames].sort();
  expect(filenames).toEqual(sorted);
});

test('loadRecipes parses frontmatter correctly', () => {
  const recipes = loadRecipes();
  const carbonara = recipes.find(r => r.filename === 'pasta-carbonara.md');
  expect(carbonara).toBeDefined();
  expect(carbonara.title).toBe('Pasta Carbonara');
  expect(carbonara.servings).toBe(4);
  expect(carbonara.bodyHtml).toContain('spaghetti');
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

test('buildHTML produces full HTML with pages of 4 cards', () => {
  const html = buildHTML();
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toContain('class="page"');
  expect(html).toContain('class="card"');
  // 5 recipes = 1 full page (4) + 1 partial page (1)
  const pageCount = (html.match(/class="page"/g) || []).length;
  expect(pageCount).toBe(2);
});
