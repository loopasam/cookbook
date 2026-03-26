import { test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const templatePath = path.join(process.cwd(), 'templates', 'layout.html');

test('layout.html template exists', () => {
  expect(fs.existsSync(templatePath)).toBe(true);
});

test('template has A4 page size CSS rule', () => {
  const content = fs.readFileSync(templatePath, 'utf-8');
  expect(content).toContain('@page');
  expect(content).toContain('A4');
});

test('template has a 2x2 grid layout', () => {
  const content = fs.readFileSync(templatePath, 'utf-8');
  expect(content).toContain('grid');
  expect(content).toContain('1fr 1fr');
});

test('template has a {{CARDS}} placeholder for recipe injection', () => {
  const content = fs.readFileSync(templatePath, 'utf-8');
  expect(content).toContain('{{CARDS}}');
});

test('template has solid grey border for card boxes', () => {
  const content = fs.readFileSync(templatePath, 'utf-8');
  expect(content).toContain('solid');
});
