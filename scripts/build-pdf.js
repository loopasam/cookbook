import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const CATEGORY_ORDER = ['basics', 'starters', 'salads', 'mains', 'sides', 'desserts', 'drinks'];

const ROOT = path.resolve(import.meta.dirname, '..');
const RECIPES_DIR = path.join(ROOT, 'recipes');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'layout.html');
const OUTPUT_DIR = path.join(ROOT, 'output');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'cookbook.pdf');

export function loadRecipes() {
  const files = fs.readdirSync(RECIPES_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  const recipes = files.map(filename => {
    const raw = fs.readFileSync(path.join(RECIPES_DIR, filename), 'utf-8');
    const { data, content } = matter(raw);

    if (!data.category) {
      throw new Error(
        `Recipe "${filename}" is missing a "category" field in its frontmatter.\n` +
        `Valid categories: ${CATEGORY_ORDER.join(', ')}`
      );
    }
    if (!CATEGORY_ORDER.includes(data.category)) {
      throw new Error(
        `Recipe "${filename}" has invalid category "${data.category}".\n` +
        `Valid categories: ${CATEGORY_ORDER.join(', ')}`
      );
    }

    const bodyHtml = md.render(content);
    return {
      filename,
      title: data.title,
      category: data.category,
      servings: data.servings,
      bodyHtml,
    };
  });

  // Sort by fixed category order, then by filename within category
  recipes.sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.category);
    const catB = CATEGORY_ORDER.indexOf(b.category);
    if (catA !== catB) return catA - catB;
    return a.filename.localeCompare(b.filename);
  });

  return recipes;
}

export function renderCard(recipe, sizeClass = '') {
  const cls = sizeClass ? `card ${sizeClass}` : 'card';
  return `<div class="${cls}">
  <h1>${recipe.title}</h1>
  <div class="servings">Servings: ${recipe.servings}</div>
  ${recipe.bodyHtml}
</div>`;
}

// A4 portrait: 297mm - 2×8mm margins = 281mm usable height, 210mm - 2×8mm = 194mm usable width
// 2×2 grid → each row ≈ 140mm, each column ≈ 97mm
export const ROW_HEIGHT_MM = 140.5; // 281mm / 2 rows
const QUARTER_WIDTH = '97mm';
const HALF_WIDTH = '194mm';
const PX_PER_MM = 3.78; // 96 dpi

const CARD_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8pt; }
  .card { padding: 4mm; }
  .card h1 { font-size: 12pt; margin-bottom: 2mm; }
  .card .servings { font-size: 7pt; margin-bottom: 2mm; }
  .card h2 { font-size: 8.5pt; margin-top: 2mm; margin-bottom: 1mm; }
  .card ul, .card ol { padding-left: 4mm; margin-bottom: 1mm; }
  .card li { margin-bottom: 0.5mm; line-height: 1.3; }
  .card ul { list-style: none; padding-left: 0; }
`;

async function measureAtWidth(page, cards, width) {
  const html = `<html><head><style>${CARD_STYLES}</style></head><body>
    ${cards.map((c, i) =>
      `<div class="card" id="card-${i}" style="width:${width};">${c.cardHtml.replace(/^<div class="card[^"]*">/, '').replace(/<\/div>$/, '')}</div>`
    ).join('\n')}
  </body></html>`;

  await page.setContent(html, { waitUntil: 'load' });

  return page.evaluate((count) => {
    return Array.from({ length: count }, (_, i) => {
      const el = document.getElementById(`card-${i}`);
      return el ? el.offsetHeight : 0;
    });
  }, cards.length);
}

export async function measureCards(cards) {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch();
  const page = await browser.newPage();

  // Pass 1: measure all cards at quarter-width
  const quarterHeights = await measureAtWidth(page, cards, QUARTER_WIDTH);

  // Find cards that overflow at quarter-width
  const overflowIndices = [];
  const results = cards.map((card, i) => {
    const heightMm = quarterHeights[i] / PX_PER_MM;
    if (heightMm <= ROW_HEIGHT_MM) {
      return { ...card, size: 'quarter', heightMm };
    }
    overflowIndices.push(i);
    return { ...card, size: null, heightMm }; // to be determined
  });

  // Pass 2: re-measure overflow cards at half-width
  if (overflowIndices.length > 0) {
    const overflowCards = overflowIndices.map(i => cards[i]);
    const halfHeights = await measureAtWidth(page, overflowCards, HALF_WIDTH);

    overflowIndices.forEach((origIdx, j) => {
      const halfHeightMm = halfHeights[j] / PX_PER_MM;
      if (halfHeightMm <= ROW_HEIGHT_MM) {
        results[origIdx] = { ...results[origIdx], size: 'half', halfHeightMm };
      } else {
        results[origIdx] = { ...results[origIdx], size: 'full', halfHeightMm };
      }
    });
  }

  await browser.close();
  return results;
}

export function packPages(cards) {
  const SLOTS_PER_PAGE = 4;
  const sizeSlots = { quarter: 1, half: 2, full: 4 };

  const pages = [];
  let currentPage = [];
  let usedSlots = 0;

  for (const card of cards) {
    const needed = sizeSlots[card.size];

    // Half cards must start at a row boundary (0 or 2 slots used)
    // If we have 1 or 3 slots used, a half card won't align — start new page
    if (needed === 2 && usedSlots % 2 !== 0) {
      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
      currentPage = [card];
      usedSlots = needed;
    } else if (usedSlots + needed > SLOTS_PER_PAGE) {
      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
      currentPage = [card];
      usedSlots = needed;
    } else {
      currentPage.push(card);
      usedSlots += needed;
    }

    if (usedSlots === SLOTS_PER_PAGE) {
      pages.push(currentPage);
      currentPage = [];
      usedSlots = 0;
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

export async function buildHTML() {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const recipes = loadRecipes();
  const cards = recipes.map(r => ({ ...r, cardHtml: renderCard(r) }));

  // Measure and classify
  const measured = await measureCards(cards);

  // Re-render with size class
  const sized = measured.map(c => ({
    ...c,
    cardHtml: renderCard(c, c.size === 'quarter' ? '' : c.size),
  }));

  // Pack into pages
  const pages = packPages(sized);

  const pagesHtml = pages.map(pageCards =>
    `<div class="page">\n${pageCards.map(c => c.cardHtml).join('\n')}\n</div>`
  );

  return template.replace('{{CARDS}}', pagesHtml.join('\n'));
}

export async function buildPDF() {
  const puppeteer = await import('puppeteer');
  const html = await buildHTML();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.default.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: OUTPUT_PATH,
    format: 'A4',
    printBackground: true,
  });
  await browser.close();
  console.log(`PDF generated: ${OUTPUT_PATH}`);
}

// Run if executed directly
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  buildPDF().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
