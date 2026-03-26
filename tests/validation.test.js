import { test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadRecipes } from '../scripts/build-pdf.js';

const RECIPES_DIR = path.join(process.cwd(), 'recipes');
const TEMP_FILE = path.join(RECIPES_DIR, '_test-validation-temp.md');

beforeEach(() => {
  if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
});

afterEach(() => {
  if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
});

test('loadRecipes throws on invalid category with helpful message', () => {
  fs.writeFileSync(TEMP_FILE, `---
title: Bad Recipe
category: brunch
servings: 2
---

## Ingredients
- 🥚 Eggs

## Steps
1. Cook the eggs 🥚
`);

  expect(() => loadRecipes()).toThrow('brunch');
  expect(() => loadRecipes()).toThrow('basics');  // should list valid options
});

test('loadRecipes throws on missing category', () => {
  fs.writeFileSync(TEMP_FILE, `---
title: No Category Recipe
servings: 2
---

## Ingredients
- 🥚 Eggs

## Steps
1. Cook the eggs 🥚
`);

  expect(() => loadRecipes()).toThrow('category');
});
