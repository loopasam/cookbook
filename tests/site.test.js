import { test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { buildSite } from '../scripts/build-site.js';
import { loadRecipes } from '../scripts/build-pdf.js';

const DOCS_DIR = path.resolve(import.meta.dirname, '..', 'docs');

test('buildSite creates docs directory', async () => {
  await buildSite();
  expect(fs.existsSync(DOCS_DIR)).toBe(true);
});

test('buildSite generates one HTML file per recipe', async () => {
  await buildSite();
  const recipes = loadRecipes();
  for (const r of recipes) {
    const slug = r.filename.replace('.md', '');
    const htmlPath = path.join(DOCS_DIR, `${slug}.html`);
    expect(fs.existsSync(htmlPath), `missing ${slug}.html`).toBe(true);

    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toContain('<html');
    expect(html).toContain('style.css');
    expect(html).toContain(r.title);
    expect(html).toContain('Servings');
  }
});

test('buildSite generates index.html with all recipes grouped by category', async () => {
  await buildSite();
  const indexPath = path.join(DOCS_DIR, 'index.html');
  expect(fs.existsSync(indexPath)).toBe(true);

  const html = fs.readFileSync(indexPath, 'utf-8');
  expect(html).toContain('<html');
  expect(html).toContain('style.css');

  const recipes = loadRecipes();
  // Every recipe title should be linked
  for (const r of recipes) {
    const slug = r.filename.replace('.md', '');
    expect(html).toContain(`href="${slug}.html"`);
    expect(html).toContain(r.title);
  }

  // Categories should appear in fixed order
  const CATEGORY_ORDER = ['basics', 'starters', 'salads', 'mains', 'sides', 'desserts', 'drinks'];
  const usedCategories = [...new Set(recipes.map(r => r.category))];
  const orderedUsed = CATEGORY_ORDER.filter(c => usedCategories.includes(c));
  // Check order by position in HTML
  let lastIndex = -1;
  for (const cat of orderedUsed) {
    const idx = html.indexOf(cat.charAt(0).toUpperCase() + cat.slice(1));
    expect(idx, `category "${cat}" not found in index`).toBeGreaterThan(lastIndex);
    lastIndex = idx;
  }
});

test('buildSite generates style.css', async () => {
  await buildSite();
  const cssPath = path.join(DOCS_DIR, 'style.css');
  expect(fs.existsSync(cssPath)).toBe(true);

  const css = fs.readFileSync(cssPath, 'utf-8');
  expect(css).toContain('max-width');
  expect(css.length).toBeGreaterThan(100);
});

test('buildSite copies PDF and links from index', async () => {
  await buildSite();
  const indexHtml = fs.readFileSync(path.join(DOCS_DIR, 'index.html'), 'utf-8');
  expect(indexHtml).toContain('cookbook.pdf');
});

test('recipe pages have a link back to index', async () => {
  await buildSite();
  const recipes = loadRecipes();
  const slug = recipes[0].filename.replace('.md', '');
  const html = fs.readFileSync(path.join(DOCS_DIR, `${slug}.html`), 'utf-8');
  expect(html).toContain('href="index.html"');
});
