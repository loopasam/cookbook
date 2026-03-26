import { test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadRecipes } from '../scripts/build-pdf.js';

const RECIPES_DIR = path.join(process.cwd(), 'recipes');
const TEMP_FILE = path.join(RECIPES_DIR, '_test-invalid-category.md');

function cleanup() {
  if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
}

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

  try {
    expect(() => loadRecipes()).toThrow('brunch');
    expect(() => loadRecipes()).toThrow('basics');  // should list valid options
  } finally {
    cleanup();
  }
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

  try {
    expect(() => loadRecipes()).toThrow('category');
  } finally {
    cleanup();
  }
});
