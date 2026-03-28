import fs from 'fs';
import path from 'path';
import { loadRecipes } from './build-pdf.js';

const CATEGORY_ORDER = ['basics', 'starters', 'salads', 'mains', 'sides', 'desserts', 'drinks'];

const ROOT = path.resolve(import.meta.dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUTPUT_DIR = path.join(ROOT, 'output');

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function recipePageHTML(recipe) {
  const slug = recipe.filename.replace('.md', '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${recipe.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav><a href="index.html">&larr; All Recipes</a></nav>
  <article>
    <h1>${recipe.title}</h1>
    <p class="recipe-meta">Servings: ${recipe.servings}</p>
    ${recipe.bodyHtml}
  </article>
</body>
</html>`;
}

function indexPageHTML(recipes) {
  const grouped = {};
  for (const r of recipes) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  }

  const sections = CATEGORY_ORDER
    .filter(cat => grouped[cat])
    .map(cat => {
      const items = grouped[cat]
        .map(r => {
          const slug = r.filename.replace('.md', '');
          return `      <li><a href="${slug}.html">${r.title}</a></li>`;
        })
        .join('\n');
      return `    <section>
      <h2>${capitalize(cat)}</h2>
      <ul>
${items}
      </ul>
    </section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cookbook</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Cookbook</h1>
    <p><a href="cookbook.pdf">Download PDF</a></p>
  </header>
  <main>
${sections}
  </main>
</body>
</html>`;
}

const STYLE_CSS = `/* Cookbook site styles */
*, *::before, *::after { box-sizing: border-box; }

body {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #222;
  background: #fff;
}

h1 { font-size: 1.6rem; margin: 0.5em 0; }
h2 { font-size: 1.2rem; margin: 1.2em 0 0.4em; }

nav { margin-bottom: 1rem; }
nav a { color: #555; text-decoration: none; }
nav a:hover { text-decoration: underline; }

a { color: #1a6dd4; text-decoration: none; }
a:hover { text-decoration: underline; }

.recipe-meta { color: #666; font-size: 0.9rem; margin: 0.2em 0 1em; }

ul { list-style: none; padding-left: 0; }
ul li { padding: 0.15em 0; }

ol { padding-left: 1.4em; }
ol li { padding: 0.2em 0; }

header { border-bottom: 1px solid #eee; margin-bottom: 1.5rem; padding-bottom: 0.5rem; }

section { margin-bottom: 1.5rem; }
section ul { margin: 0; }
section ul li { padding: 0.1em 0; }

article ul, article ol { margin-bottom: 0.8em; }
`;

export async function buildSite() {
  // Create docs dir
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  const recipes = loadRecipes();

  // Write individual recipe pages
  for (const r of recipes) {
    const slug = r.filename.replace('.md', '');
    fs.writeFileSync(path.join(DOCS_DIR, `${slug}.html`), recipePageHTML(r));
  }

  // Write index
  fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), indexPageHTML(recipes));

  // Write CSS
  fs.writeFileSync(path.join(DOCS_DIR, 'style.css'), STYLE_CSS);

  // Copy PDF if it exists
  const pdfSrc = path.join(OUTPUT_DIR, 'cookbook.pdf');
  if (fs.existsSync(pdfSrc)) {
    fs.copyFileSync(pdfSrc, path.join(DOCS_DIR, 'cookbook.pdf'));
  }
}

// Run if executed directly
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  buildSite().then(() => {
    console.log(`Site generated: ${DOCS_DIR}`);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
