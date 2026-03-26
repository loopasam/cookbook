import { test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const recipesDir = path.join(process.cwd(), 'recipes');

function getRecipeFiles() {
  return fs.readdirSync(recipesDir).filter(f => f.endsWith('.md')).sort();
}

test('recipes folder exists and has at least 4 recipes', () => {
  const files = getRecipeFiles();
  expect(files.length).toBeGreaterThanOrEqual(4);
});

test('all recipe filenames are lowercase kebab-case', () => {
  const files = getRecipeFiles();
  for (const file of files) {
    expect(file).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*\.md$/);
  }
});

test('all recipes have valid frontmatter with title, category, and servings', () => {
  const files = getRecipeFiles();
  for (const file of files) {
    const content = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
    const { data } = matter(content);
    expect(data.title, `${file} missing title`).toBeDefined();
    expect(typeof data.title).toBe('string');
    expect(data.category, `${file} missing category`).toBeDefined();
    expect(typeof data.category).toBe('string');
    expect(data.category, `${file} category should be lowercase`).toMatch(/^[a-z]+$/);
    expect(data.servings, `${file} missing servings`).toBeDefined();
  }
});

test('all recipes have Ingredients and Steps sections', () => {
  const files = getRecipeFiles();
  for (const file of files) {
    const content = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
    expect(content, `${file} missing ## Ingredients`).toContain('## Ingredients');
    expect(content, `${file} missing ## Steps`).toContain('## Steps');
  }
});

test('all ingredients have emoji markers', () => {
  const files = getRecipeFiles();
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
  for (const file of files) {
    const content = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
    const ingredientsSection = content.split('## Ingredients')[1].split('## Steps')[0];
    const lines = ingredientsSection.trim().split('\n').filter(l => l.startsWith('- '));
    expect(lines.length, `${file} has no ingredients`).toBeGreaterThan(0);
    for (const line of lines) {
      expect(line, `${file} ingredient missing emoji: ${line}`).toMatch(emojiRegex);
    }
  }
});
