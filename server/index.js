import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    area INTEGER NOT NULL,
    price INTEGER NOT NULL,
    wantsSalt INTEGER NOT NULL,
    hasEquipment INTEGER NOT NULL,
    description TEXT NOT NULL,
    ownerPassword TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    status TEXT NOT NULL,
    takenByPhone TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_tasks_createdAt ON tasks(createdAt DESC);
  CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(phone, ownerPassword);
`);

app.use(express.json({ limit: '1mb' }));

const mapTask = (row, includeTakenPhone) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  address: row.address,
  area: row.area,
  price: row.price,
  wantsSalt: Boolean(row.wantsSalt),
  hasEquipment: Boolean(row.hasEquipment),
  description: row.description,
  createdAt: row.createdAt,
  status: row.status,
  takenByPhone: includeTakenPhone ? row.takenByPhone || undefined : undefined
});

app.get('/api/tasks', (_req, res) => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
  res.json(rows.map((row) => mapTask(row, false)));
});

app.get('/api/tasks/mine', (req, res) => {
  const phone = String(req.query.phone || '').trim();
  const password = String(req.query.password || '').trim();
  if (!phone || !password) {
    return res.status(400).send('Telefonnummer og password er påkrævet.');
  }
  const rows = db.prepare('SELECT * FROM tasks WHERE phone = ? AND ownerPassword = ? ORDER BY createdAt DESC').all(phone, password);
  res.json(rows.map((row) => mapTask(row, true)));
});

app.post('/api/tasks', (req, res) => {
  const {
    name,
    phone,
    address,
    area,
    price,
    wantsSalt,
    hasEquipment,
    description,
    ownerPassword
  } = req.body || {};

  if (!name || !phone || !address || !area || !price || ownerPassword === undefined) {
    return res.status(400).send('Manglende felter.');
  }

  const id = Math.random().toString(36).slice(2, 10);
  const createdAt = Date.now();
  const status = 'available';
  const stmt = db.prepare(`
    INSERT INTO tasks (
      id, name, phone, address, area, price, wantsSalt, hasEquipment, description,
      ownerPassword, createdAt, status, takenByPhone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    String(name).trim(),
    String(phone).trim(),
    String(address).trim(),
    Number(area),
    Number(price),
    wantsSalt ? 1 : 0,
    hasEquipment ? 1 : 0,
    String(description || '').trim(),
    String(ownerPassword).trim(),
    createdAt,
    status,
    null
  );

  res.json({ id, createdAt, status });
});

app.post('/api/tasks/:id/take', (req, res) => {
  const id = req.params.id;
  const phone = String(req.body?.phone || '').trim();
  if (!phone) {
    return res.status(400).send('Telefonnummer er påkrævet.');
  }
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).send('Opgave findes ikke.');
  }
  db.prepare('UPDATE tasks SET status = ?, takenByPhone = ? WHERE id = ?').run('taken', phone, id);
  res.json({ ok: true });
});

app.post('/api/tasks/:id/clear-taken', (req, res) => {
  const id = req.params.id;
  const phone = String(req.body?.phone || '').trim();
  const password = String(req.body?.password || '').trim();
  if (!phone || !password) {
    return res.status(400).send('Telefonnummer og password er påkrævet.');
  }
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND phone = ? AND ownerPassword = ?').get(id, phone, password);
  if (!existing) {
    return res.status(403).send('Forkert password.');
  }
  db.prepare('UPDATE tasks SET status = ?, takenByPhone = NULL WHERE id = ?').run('available', id);
  res.json({ ok: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  const phone = String(req.body?.phone || '').trim();
  const password = String(req.body?.password || '').trim();
  if (!phone || !password) {
    return res.status(400).send('Telefonnummer og password er påkrævet.');
  }
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND phone = ? AND ownerPassword = ?').get(id, phone, password);
  if (!existing) {
    return res.status(403).send('Forkert password.');
  }
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.json({ ok: true });
});

const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SneRyd server running on port ${PORT}`);
});
