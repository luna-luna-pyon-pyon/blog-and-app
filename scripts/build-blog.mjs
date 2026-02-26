import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const postsDir = path.join(root, 'posts');
const outDir = path.join(root, 'blog');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function escapeHtml(str = '') {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function mdInline(text) {
  let t = escapeHtml(text);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return t;
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  let html = '';
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += '</ul>\n';
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closeList();
      continue;
    }

    if (line.startsWith('### ')) {
      closeList();
      html += `<h3>${mdInline(line.slice(4))}</h3>\n`;
      continue;
    }

    if (line.startsWith('## ')) {
      closeList();
      html += `<h2>${mdInline(line.slice(3))}</h2>\n`;
      continue;
    }

    if (line.startsWith('# ')) {
      closeList();
      html += `<h1>${mdInline(line.slice(2))}</h1>\n`;
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `<li>${mdInline(line.slice(2))}</li>\n`;
      continue;
    }

    closeList();
    html += `<p>${mdInline(line)}</p>\n`;
  }

  closeList();
  return html;
}

function parsePost(content) {
  const fm = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fm) {
    return { title: 'Untitled', date: '', body: content };
  }

  const metaRaw = fm[1];
  const body = fm[2].trim();
  const meta = {};

  for (const line of metaRaw.split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    meta[key] = val;
  }

  return {
    title: meta.title || 'Untitled',
    date: meta.date || '',
    body,
  };
}

function pageTemplate({ title, content }) {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="../style.css" />
</head>
<body>
  <main class="container">
    ${content}
  </main>
</body>
</html>
`;
}

function indexTemplate(posts) {
  const items = posts
    .map(
      (p) => `<li><a href="${p.slug}.html">${escapeHtml(p.date)} — ${escapeHtml(p.title)}</a></li>`
    )
    .join('\n');

  const content = `
<a class="back-link" href="../index.html">← トップに戻る</a>
<h1>ブログ</h1>
<p>日付別のミニブログ一覧です。</p>
<div class="card blog-entry">
  <ul>
    ${items}
  </ul>
</div>`;

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" />
  <title>ブログ一覧</title>
  <link rel="stylesheet" href="../style.css" />
</head>
<body>
  <main class="container">${content}</main>
</body>
</html>
`;
}

ensureDir(outDir);
const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md')).sort().reverse();
const posts = [];

for (const file of files) {
  const full = path.join(postsDir, file);
  const raw = fs.readFileSync(full, 'utf8');
  const { title, date, body } = parsePost(raw);
  const slug = path.basename(file, '.md');
  const article = markdownToHtml(body);

  const content = `
<a class="back-link" href="index.html">← ブログ一覧へ</a>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(date)}</p>
<div class="card blog-entry">${article}</div>`;

  const html = pageTemplate({ title: `${title} | ブログ`, content });
  fs.writeFileSync(path.join(outDir, `${slug}.html`), html, 'utf8');
  posts.push({ slug, title, date });
}

fs.writeFileSync(path.join(outDir, 'index.html'), indexTemplate(posts), 'utf8');
console.log(`Built ${posts.length} post(s) into /blog`);
