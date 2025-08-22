import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getDb, init as initDb } from './db.js';
import bcrypt from 'bcrypt';

const app = express();
const db = getDb();

const PORT = process.env.PORT || 8443;
const BIND = process.env.BIND_ADDRESS || '127.0.0.1';
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/opt/webapps/cv-blog/uploads';
const CORS_ORIGIN = process.env.CORS_ORIGIN || undefined; // set in prod
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.set('trust proxy', 1);
const PROD = process.env.NODE_ENV === 'production';

// util: auth middleware
function ensureAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '_');
    const name = `${Date.now()}_${base}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// --- Auth ---
app.get('/api/auth/me', ensureAuth, (req, res) => {
  res.json({ me: req.user }); // { email }
});

app.post('/api/auth/login', (req, res) => {
const { email, password } = req.body || {};
  const row = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: PROD, path: '/', maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => { res.clearCookie('token'); res.json({ ok: true }); });

// --- Public content ---
app.get('/api/profile', (req, res) => {
  const row = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  const safe = row || { name:'', title:'', location:'', photo_url:'', socials_json:'[]', certs_json:'[]' };

  const parse = (v, def) => { try { return JSON.parse(v ?? def); } catch { return JSON.parse(def); } };
  let socials = parse(safe.socials_json, '[]');
  let certs   = parse(safe.certs_json,   '[]');

  // If socials came in as object, convert to array
  if (!Array.isArray(socials) && socials && typeof socials === 'object') {
    socials = Object.entries(socials).map(([key, url]) => ({ key, url, icon: key }));
  }
  if (!Array.isArray(certs)) certs = [];

  res.json({ ...safe, socials, certs });
});

app.get('/api/projects', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY datetime(created_at) DESC').all();
  res.json(rows);
});

app.get('/api/posts', (req, res) => {
  const rows = db.prepare('SELECT id, title, slug, excerpt, cover_url, created_at FROM posts ORDER BY datetime(created_at) DESC').all();
  res.json(rows);
  });

app.get('/api/posts/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM posts WHERE slug = ? AND COALESCE(published,1)=1').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
});

app.get('/api/admin/posts', ensureAuth, (req, res) => {
  const rows = db.prepare(`SELECT * FROM posts ORDER BY datetime(created_at) DESC, id DESC`).all();
  res.json(rows);
});


app.get('/api/timeline', (req, res) => {
  const rows = db.prepare('SELECT * FROM timeline ORDER BY date DESC').all();
  res.json(rows);
});

app.get('/api/cv', (req, res) => {
  const meta = db.prepare('SELECT * FROM cv_meta WHERE id=1').get()
           || { headline:'', summary:'', name:'', tagline:'', location:'' };

  const profile = db.prepare('SELECT name, title, location FROM profile WHERE id=1').get()
               || { name:'', title:'', location:'' };

  const exp = db.prepare('SELECT * FROM cv_experience ORDER BY sort ASC, start_date DESC, id DESC').all()
    .map(r => ({ ...r, bullets: safeParse(r.bullets_json, []), tech: safeParse(r.tech_json, []) }));

  const edu = db.prepare('SELECT * FROM cv_education ORDER BY sort ASC, end_date DESC, id DESC').all()
    .map(r => ({ ...r, notes: safeParse(r.notes_json, []) }));

  const skills = db.prepare('SELECT * FROM cv_skills ORDER BY sort ASC, id ASC').all()
    .map(r => ({ ...r, items: safeParse(r.items_json, []) }));

  const links = db.prepare('SELECT * FROM cv_links ORDER BY sort ASC, id ASC').all()
    .map(l => ({
      ...l,
      display: displayForLink(l)
    }));

  const certs = db.prepare('SELECT * FROM cv_certs ORDER BY sort ASC, issued DESC, id DESC').all();

  res.json({ meta, profile, exp, edu, skills, links, certs });
});

function displayForLink(l){
  const lbl = (l.label || '').trim();
  const url = (l.url || '').trim();
  if (url.startsWith('mailto:')) return url.replace(/^mailto:/,'');
  if (url.startsWith('tel:')) return url.replace(/^tel:/,'');
  try { const u = new URL(url); return u.host + (u.pathname !== '/' ? u.pathname : ''); } catch {}
  return lbl || url;
}

function safeParse(s, d){ try { return JSON.parse(s ?? ''); } catch { return d; } }

// --- Contacts (public list) ---
app.get('/api/contacts', (req, res) => {
  const rows = db.prepare('SELECT * FROM contacts ORDER BY sort ASC, id ASC').all();
  res.json(rows);
});

// --- Admin: Contacts CRUD ---
app.post('/api/contacts', ensureAuth, (req, res) => {
  const { label, value, url, sort = 0 } = req.body || {};
  const info = db.prepare('INSERT INTO contacts (label, value, url, sort) VALUES (?,?,?,?)')
    .run(label, value, url, sort);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/contacts/:id', ensureAuth, (req, res) => {
  const { label, value, url, sort = 0 } = req.body || {};
  db.prepare('UPDATE contacts SET label=?, value=?, url=?, sort=? WHERE id=?')
    .run(label, value, url, sort, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/contacts/:id', ensureAuth, (req, res) => {
  db.prepare('DELETE FROM contacts WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// --- Admin CRUD (protected) ---
app.get('/api/uploads', ensureAuth, (req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR)
    .filter(f => !f.startsWith('.'))
    .map(name => {
      const p = path.join(UPLOADS_DIR, name);
      const st = fs.statSync(p);
      return {
        name,
        size: st.size,
        mtime: st.mtimeMs,
        url: `/uploads/${name}`
      };
    })
    .sort((a,b) => b.mtime - a.mtime);
  res.json(files);
});

app.post('/api/upload', ensureAuth, upload.single('file'), (req, res) => {
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({ url: publicUrl });
});

app.delete('/api/uploads/:name', ensureAuth, (req, res) => {
  const name = req.params.name || '';
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return res.status(400).json({ error: 'Bad filename' });
  }
  const p = path.join(UPLOADS_DIR, name);
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(p);
  res.json({ ok: true });
});

app.put('/api/profile', ensureAuth, (req, res) => {
  const { name, title, location, photo_url } = req.body || {};
  let { socials, certs } = req.body || {};
  if (!Array.isArray(socials)) socials = [];
  if (!Array.isArray(certs))   certs   = [];
  db.prepare('UPDATE profile SET name=?, title=?, location=?, photo_url=?, socials_json=?, certs_json=? WHERE id=1')
    .run(name, title, location, photo_url, JSON.stringify(socials), JSON.stringify(certs));
  res.json({ ok: true });
});

// projects
app.post('/api/projects', ensureAuth, (req, res) => {
  const { title, summary, tags, url, repo_url, cover_url } = req.body || {};
  const info = db.prepare('INSERT INTO projects (title, summary, tags, url, repo_url, cover_url) VALUES (?,?,?,?,?,?)')
    .run(title, summary, tags, url, repo_url, cover_url);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/projects/:id', ensureAuth, (req, res) => {
  const { title, summary, tags, url, repo_url, cover_url } = req.body || {};
  db.prepare('UPDATE projects SET title=?, summary=?, tags=?, url=?, repo_url=?, cover_url=? WHERE id=?')
    .run(title, summary, tags, url, repo_url, cover_url, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/projects/:id', ensureAuth, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// posts
app.post('/api/posts', ensureAuth, (req, res) => {
  const { title, slug } = req.body || {};
  if (!title || !slug) return res.status(400).json({ error: 'title and slug required' });

  const excerpt   = typeof req.body.excerpt   === 'string' ? req.body.excerpt   : '';
  const body_md   = typeof req.body.body_md   === 'string' ? req.body.body_md   : '';
  const cover_url = typeof req.body.cover_url === 'string' ? req.body.cover_url : null;
  const published = Number(!!req.body.published);

  const info = db.prepare(`
    INSERT INTO posts (title, slug, excerpt, body_md, cover_url, published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(title, slug.trim(), excerpt, body_md, cover_url, published);

  res.json({ id: info.lastInsertRowid });
});

app.put('/api/posts/:id', ensureAuth, (req, res) => {
  const id = Number(req.params.id);
  const { title, slug } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Bad id' });
  if (!title || !slug) return res.status(400).json({ error: 'title and slug required' });

  const excerpt   = typeof req.body.excerpt   === 'string' ? req.body.excerpt   : '';
  const body_md   = typeof req.body.body_md   === 'string' ? req.body.body_md   : '';
  const cover_url = typeof req.body.cover_url === 'string' ? req.body.cover_url : null;
  const published = Number(!!req.body.published);

  db.prepare(`
    UPDATE posts
    SET title=?, slug=?, excerpt=?, body_md=?, cover_url=?, published=?, updated_at=datetime('now')
    WHERE id=?
  `).run(title, slug.trim(), excerpt, body_md, cover_url, published, id);

  res.json({ ok: true });
});

app.delete('/api/posts/:id', ensureAuth, (req, res) => {
  db.prepare('DELETE FROM posts WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// timeline
app.post('/api/timeline', ensureAuth, (req, res) => {
  const { date, label, description, icon } = req.body || {};
  const info = db.prepare('INSERT INTO timeline (date, label, description, icon) VALUES (?,?,?,?)')
    .run(date, label, description, icon);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/timeline/:id', ensureAuth, (req, res) => {
  const { date, label, description, icon } = req.body || {};
  db.prepare('UPDATE timeline SET date=?, label=?, description=?, icon=? WHERE id=?')
    .run(date, label, description, icon, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/timeline/:id', ensureAuth, (req, res) => {
  db.prepare('DELETE FROM timeline WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---- ADMIN: Meta
app.put('/api/cv/meta', ensureAuth, (req,res) => {
  const { headline='', summary='', name='', tagline='', location='' } = req.body || {};
  db.prepare(`
    INSERT INTO cv_meta (id,headline,summary,name,tagline,location)
    VALUES (1,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      headline=excluded.headline,
      summary=excluded.summary,
      name=excluded.name,
      tagline=excluded.tagline,
      location=excluded.location
  `).run(headline, summary, name, tagline, location);
  res.json({ ok: true });
});

// ---- ADMIN: Experience CRUD
app.post('/api/cv/experience', ensureAuth, (req,res) => {
  const { company, role, location='', start_date, end_date='', bullets=[], tech=[], sort=0 } = req.body || {};
  if(!company || !role || !start_date) return res.status(400).json({ error:'company, role, start_date required' });
  const info = db.prepare(`INSERT INTO cv_experience (company,role,location,start_date,end_date,bullets_json,tech_json,sort)
    VALUES (?,?,?,?,?,?,?,?)`).run(company,role,location,start_date,end_date,JSON.stringify(bullets),JSON.stringify(tech),sort);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/cv/experience/:id', ensureAuth, (req,res) => {
  const id = Number(req.params.id);
  const { company, role, location='', start_date, end_date='', bullets=[], tech=[], sort=0 } = req.body || {};
  db.prepare(`UPDATE cv_experience SET company=?, role=?, location=?, start_date=?, end_date=?, bullets_json=?, tech_json=?, sort=? WHERE id=?`)
    .run(company, role, location, start_date, end_date, JSON.stringify(bullets), JSON.stringify(tech), sort, id);
  res.json({ ok:true });
});
app.delete('/api/cv/experience/:id', ensureAuth, (req,res) => {
  db.prepare('DELETE FROM cv_experience WHERE id=?').run(Number(req.params.id));
  res.json({ ok:true });
});

// ---- ADMIN: Education CRUD
app.post('/api/cv/education', ensureAuth, (req,res)=>{
  const { school, degree, location='', start_date='', end_date='', notes=[], sort=0 } = req.body || {};
  if(!school || !degree) return res.status(400).json({ error:'school, degree required' });
  const info = db.prepare(`INSERT INTO cv_education (school,degree,location,start_date,end_date,notes_json,sort)
    VALUES (?,?,?,?,?,?,?)`).run(school,degree,location,start_date,end_date,JSON.stringify(notes),sort);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/cv/education/:id', ensureAuth, (req,res)=>{
  const id = Number(req.params.id);
  const { school, degree, location='', start_date='', end_date='', notes=[], sort=0 } = req.body || {};
  db.prepare(`UPDATE cv_education SET school=?, degree=?, location=?, start_date=?, end_date=?, notes_json=?, sort=? WHERE id=?`)
    .run(school,degree,location,start_date,end_date,JSON.stringify(notes),sort,id);
  res.json({ ok:true });
});
app.delete('/api/cv/education/:id', ensureAuth, (req,res)=>{
  db.prepare('DELETE FROM cv_education WHERE id=?').run(Number(req.params.id));
  res.json({ ok:true });
});

// ---- ADMIN: Skills CRUD (group rows)
app.post('/api/cv/skills', ensureAuth, (req,res)=>{
  const { category, items=[], sort=0 } = req.body || {};
  if(!category) return res.status(400).json({ error:'category required' });
  const info = db.prepare(`INSERT INTO cv_skills (category,items_json,sort) VALUES (?,?,?)`)
    .run(category, JSON.stringify(items), sort);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/cv/skills/:id', ensureAuth, (req,res)=>{
  const id = Number(req.params.id);
  const { category, items=[], sort=0 } = req.body || {};
  db.prepare(`UPDATE cv_skills SET category=?, items_json=?, sort=? WHERE id=?`)
    .run(category, JSON.stringify(items), sort, id);
  res.json({ ok:true });
});
app.delete('/api/cv/skills/:id', ensureAuth, (req,res)=>{
  db.prepare('DELETE FROM cv_skills WHERE id=?').run(Number(req.params.id));
  res.json({ ok:true });
});

app.post('/api/cv/certs', ensureAuth, (req,res)=>{
  const { name, issuer='', issued='', url='', sort=0 } = req.body || {};
  if(!name) return res.status(400).json({ error:'name required' });
  const info = db.prepare(`INSERT INTO cv_certs (name,issuer,issued,url,sort) VALUES (?,?,?,?,?)`)
    .run(name, issuer, issued, url, +sort||0);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/cv/certs/:id', ensureAuth, (req,res)=>{
  const id = +req.params.id;
  const { name, issuer='', issued='', url='', sort=0 } = req.body || {};
  db.prepare(`UPDATE cv_certs SET name=?, issuer=?, issued=?, url=?, sort=? WHERE id=?`)
    .run(name, issuer, issued, url, +sort||0, id);
  res.json({ ok:true });
});
app.delete('/api/cv/certs/:id', ensureAuth, (req,res)=>{
  db.prepare('DELETE FROM cv_certs WHERE id=?').run(+req.params.id);
  res.json({ ok:true });
});

// ---- ADMIN: Links CRUD
app.post('/api/cv/links', ensureAuth, (req,res)=>{
  const { label, url, sort=0 } = req.body || {};
  if(!label || !url) return res.status(400).json({ error:'label, url required' });
  const info = db.prepare(`INSERT INTO cv_links (label,url,sort) VALUES (?,?,?)`).run(label,url,sort);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/cv/links/:id', ensureAuth, (req,res)=>{
  const id = Number(req.params.id);
  const { label, url, sort=0 } = req.body || {};
  db.prepare(`UPDATE cv_links SET label=?, url=?, sort=? WHERE id=?`).run(label,url,sort,id);
  res.json({ ok:true });
});
app.delete('/api/cv/links/:id', ensureAuth, (req,res)=>{
  db.prepare('DELETE FROM cv_links WHERE id=?').run(Number(req.params.id));
  res.json({ ok:true });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV !== 'production') {
  initDb();
}

app.listen(PORT, BIND, () => {
  console.log(`API listening on http://${BIND}:${PORT}`);
});
