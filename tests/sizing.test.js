import { test, expect } from 'vitest';
import { loadRecipes, renderCard, buildHTML } from '../scripts/build-pdf.js';

test('buildHTML creates one page per recipe', async () => {
  const recipes = loadRecipes();
  const html = await buildHTML();
  const pageCount = (html.match(/class="page"/g) || []).length;
  expect(pageCount).toBe(recipes.length);
}, 30000);
