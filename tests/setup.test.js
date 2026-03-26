import { test, expect } from 'vitest';

test('markdown-it is available', async () => {
  const md = await import('markdown-it');
  expect(md).toBeDefined();
});

test('gray-matter is available', async () => {
  const matter = await import('gray-matter');
  expect(matter).toBeDefined();
});

test('puppeteer is available', async () => {
  const puppeteer = await import('puppeteer');
  expect(puppeteer).toBeDefined();
});
