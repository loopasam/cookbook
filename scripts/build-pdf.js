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

export function renderCard(recipe) {
  return `<div class="card">
  <h1>${recipe.title}</h1>
  <div class="servings">Servings: ${recipe.servings}</div>
  ${recipe.bodyHtml}
</div>`;
}

export function buildHTML() {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const recipes = loadRecipes();
  const cards = recipes.map(r => renderCard(r));

  // Group into pages of 4
  const pages = [];
  for (let i = 0; i < cards.length; i += 4) {
    const pageCards = cards.slice(i, i + 4);
    pages.push(`<div class="page">\n${pageCards.join('\n')}\n</div>`);
  }

  return template.replace('{{CARDS}}', pages.join('\n'));
}

export async function buildPDF() {
  const puppeteer = await import('puppeteer');
  const html = buildHTML();

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
