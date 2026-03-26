import { test, expect } from 'vitest';
import { loadRecipes, renderCard, measureCards, packPages, ROW_HEIGHT_MM } from '../scripts/build-pdf.js';

test('measureCards returns recipes with a size class', async () => {
  const recipes = loadRecipes();
  const cards = recipes.map(r => ({ ...r, cardHtml: renderCard(r) }));
  const measured = await measureCards(cards);

  expect(measured.length).toBe(recipes.length);
  for (const card of measured) {
    expect(['quarter', 'half', 'full']).toContain(card.size);
  }
}, 30000);

test('short recipes are classified as quarter', async () => {
  const recipes = loadRecipes();
  const cards = recipes.map(r => ({ ...r, cardHtml: renderCard(r) }));
  const measured = await measureCards(cards);

  // Simple dressing recipes (e.g. balsamic vinaigrette) should be quarter
  const vinaigrette = measured.find(c => c.filename === 'balsamic-vinaigrette.md');
  expect(vinaigrette).toBeDefined();
  expect(vinaigrette.size).toBe('quarter');
}, 30000);

test('pumpkin miso soup (with prep) is classified as half or full', async () => {
  const recipes = loadRecipes();
  const cards = recipes.map(r => ({ ...r, cardHtml: renderCard(r) }));
  const measured = await measureCards(cards);

  const soup = measured.find(c => c.filename === 'pumpkin-miso-soup.md');
  expect(soup).toBeDefined();
  expect(['half', 'full']).toContain(soup.size);
}, 30000);

test('half cards are measured at half-width and fit within row height', async () => {
  const recipes = loadRecipes();
  const cards = recipes.map(r => ({ ...r, cardHtml: renderCard(r) }));
  const measured = await measureCards(cards);

  const halfCards = measured.filter(c => c.size === 'half');
  for (const card of halfCards) {
    // halfHeightMm should be set and ≤ ROW_HEIGHT_MM
    expect(card.halfHeightMm, `${card.filename} half-width height should fit in one row`).toBeLessThanOrEqual(ROW_HEIGHT_MM);
  }
}, 30000);

test('packPages fills pages respecting card sizes', () => {
  const cards = [
    { size: 'quarter', cardHtml: '<div class="card">Q1</div>' },
    { size: 'quarter', cardHtml: '<div class="card">Q2</div>' },
    { size: 'half', cardHtml: '<div class="card half">H1</div>' },
    { size: 'quarter', cardHtml: '<div class="card">Q3</div>' },
    { size: 'quarter', cardHtml: '<div class="card">Q4</div>' },
    { size: 'full', cardHtml: '<div class="card full">F1</div>' },
  ];

  const pages = packPages(cards);

  // Page 1: Q1 + Q2 + H1 (2 + 2 = 4 slots)
  // Page 2: Q3 + Q4 (2 slots, partially filled)
  // Page 3: F1 (4 slots)
  expect(pages.length).toBe(3);

  // Full card should be alone on its page
  const fullPage = pages.find(p => p.some(c => c.size === 'full'));
  expect(fullPage.length).toBe(1);
});
