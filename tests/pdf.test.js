import { test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { buildPDF } from '../scripts/build-pdf.js';

const OUTPUT_PATH = path.join(process.cwd(), 'output', 'cookbook.pdf');

test('buildPDF generates a PDF file', async () => {
  // Clean up any existing output
  if (fs.existsSync(OUTPUT_PATH)) {
    fs.unlinkSync(OUTPUT_PATH);
  }

  await buildPDF();

  expect(fs.existsSync(OUTPUT_PATH)).toBe(true);

  // Verify it's actually a PDF (starts with %PDF)
  const buffer = fs.readFileSync(OUTPUT_PATH);
  expect(buffer.length).toBeGreaterThan(1000);
  expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
}, 30000);
