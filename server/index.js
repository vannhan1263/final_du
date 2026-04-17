require('dotenv').config();
const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const cors     = require('cors');
const morgan   = require('morgan');
const helmet   = require('helmet');

const app      = express();
const PORT     = process.env.PORT || 3001;
const GIFTS_DIR  = path.join(__dirname, 'gifts');
const GIFTS_JSON = path.join(GIFTS_DIR, 'gifts.json');

/* ── Security headers ── */
app.use(helmet({
  contentSecurityPolicy: false,      // React + inline styles need this
  crossOriginEmbedderPolicy: false
}));

/* ── HTTP logging ── */
app.use(morgan('dev'));

/* ── CORS ── */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => o.trim() === origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  }
}));

/* ── Body parser (limit to prevent DoS) ── */
app.use(express.json({ limit: '12mb' }));

/* ── Serve saved gift images ── */
app.use('/gifts', express.static(GIFTS_DIR));

/* ── In production: serve compiled React app ── */
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuild));
}

/* ── Ensure gifts/ folder exists ── */
if (!fs.existsSync(GIFTS_DIR)) fs.mkdirSync(GIFTS_DIR, { recursive: true });

/* ── Helpers ── */
function loadGifts() {
  if (!fs.existsSync(GIFTS_JSON)) return [];
  try { return JSON.parse(fs.readFileSync(GIFTS_JSON, 'utf8')); }
  catch { return []; }
}
function saveGifts(gifts) {
  fs.writeFileSync(GIFTS_JSON, JSON.stringify(gifts, null, 2), 'utf8');
}

/* ─────────────────── API ROUTES ─────────────────── */

/* POST /api/gift – receive a gift */
app.post('/api/gift', (req, res) => {
  const { recipient, bouquet, photo, timestamp } = req.body;

  // Input validation
  if (typeof recipient !== 'string') return res.status(400).json({ ok: false, error: 'Invalid recipient' });

  const id = Date.now();
  let photoFile = null;

  if (photo && typeof photo === 'string' && photo.startsWith('data:image')) {
    const base64 = photo.replace(/^data:image\/\w+;base64,/, '');
    const buf    = Buffer.from(base64, 'base64');
    const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB
    if (buf.length > 500 && buf.length <= MAX_PHOTO_BYTES) {
      photoFile = `gift_${id}.jpg`;
      try {
        fs.writeFileSync(path.join(GIFTS_DIR, photoFile), buf);
        console.log(`  💾  Saved photo: ${photoFile} (${(buf.length/1024).toFixed(0)} KB)`);
      } catch (e) {
        console.error('  ❌  Photo save failed:', e.message);
        photoFile = null;
      }
    }
  }

  const gift = {
    id,
    recipient: String(recipient || 'Khách').slice(0, 100),
    bouquet:   String(bouquet   || '').slice(0, 500),
    photoFile,
    timestamp: String(timestamp || new Date().toLocaleString('vi-VN')).slice(0, 50),
    createdAt: new Date().toISOString()
  };

  const gifts = loadGifts();
  gifts.unshift(gift);
  saveGifts(gifts);

  console.log(`  🎁  Gift from "${gift.recipient}" | ${gift.timestamp}`);
  res.json({ ok: true, id });
});

/* GET /api/gifts – list all gifts (admin) */
app.get('/api/gifts', (_req, res) => {
  res.json(loadGifts());
});

/* DELETE /api/gifts/:id – remove a gift (admin) */
app.delete('/api/gifts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: 'Invalid id' });

  let gifts = loadGifts();
  const gift = gifts.find(g => g.id === id);
  if (gift?.photoFile) {
    const fp = path.join(GIFTS_DIR, gift.photoFile);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  gifts = gifts.filter(g => g.id !== id);
  saveGifts(gifts);
  res.json({ ok: true });
});

/* ── Production SPA fallback ── */
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

/* ── Start ── */
function startServer(port) {
  const srv = app.listen(port, () => {
    console.log('');
    console.log('  🎓  Graduation Invite API');
    console.log(`  ➜   http://localhost:${port}/api`);
    console.log(`  ➜   Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
  });
  srv.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.log(`  ⚠️   Port ${port} busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else { throw err; }
  });
}

startServer(PORT);
