const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
const { renderMarkdown } = require('../lib/render');

const router = express.Router();

const DATA_FILE = path.join(__dirname, '..', 'data', 'posts.json');
const ADMIN_TOKEN = process.env.BLOG_ADMIN_TOKEN || '';

const writeLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 20, // plenty for a small admin UI
});

// --- helpers ---
async function readPosts() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const posts = JSON.parse(raw);
    return Array.isArray(posts) ? posts : [];
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function writePosts(posts) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

function present(post) {
  return { ...post, html: renderMarkdown(post.content || '') };
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!ADMIN_TOKEN) return res.status(500).json({ error: 'Admin token not set' });
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorised' });
  next();
}

function slugify(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// --- routes ---
// GET /api/posts?limit=10
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit || '0', 10);
  const posts = (await readPosts())
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const out = (limit > 0 ? posts.slice(0, limit) : posts).map(present);
  res.json(out);
});

// GET /api/posts/:slug
router.get('/:slug', async (req, res) => {
  const posts = await readPosts();
  const post = posts.find(p => p.slug === req.params.slug);
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(present(post));
});

// POST /api/posts (create)
router.post('/', writeLimiter, requireAuth, async (req, res) => {
  const { title, date, tags = [], excerpt = '', content = '' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const posts = await readPosts();
  let slug = slugify(req.body.slug || title);
  if (!slug) slug = Math.random().toString(36).slice(2, 10);

  if (posts.some(p => p.slug === slug)) {
    return res.status(409).json({ error: 'Slug already exists' });
  }

  const now = new Date().toISOString();
  const post = {
    slug,
    title,
    date: date || now,
    tags,
    excerpt,
    content
  };

  posts.push(post);
  await writePosts(posts);
  res.status(201).json(present(post));
});

// PUT /api/posts/:slug (update)
router.put('/:slug', writeLimiter, requireAuth, async (req, res) => {
  const posts = await readPosts();
  const idx = posts.findIndex(p => p.slug === req.params.slug);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const current = posts[idx];
  const next = {
    ...current,
    ...req.body,
    slug: current.slug, // slug immutable here
  };

  posts[idx] = next;
  await writePosts(posts);
  res.json(present(next));
});

// DELETE /api/posts/:slug
router.delete('/:slug', writeLimiter, requireAuth, async (req, res) => {
  const posts = await readPosts();
  const next = posts.filter(p => p.slug !== req.params.slug);
  if (next.length === posts.length) return res.status(404).json({ error: 'Not found' });
  await writePosts(next);
  res.status(204).end();
});

module.exports = router;
