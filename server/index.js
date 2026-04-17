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
const LETTERS_DIR  = path.join(__dirname, 'letters');
const LETTERS_JSON = path.join(LETTERS_DIR, 'letters.json');

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
app.use('/letters', express.static(LETTERS_DIR));

/* ── Ensure gifts/ folder exists ── */
if (!fs.existsSync(GIFTS_DIR)) fs.mkdirSync(GIFTS_DIR, { recursive: true });
if (!fs.existsSync(LETTERS_DIR)) fs.mkdirSync(LETTERS_DIR, { recursive: true });

/* ── Helpers ── */
function loadGifts() {
  if (!fs.existsSync(GIFTS_JSON)) return [];
  try { return JSON.parse(fs.readFileSync(GIFTS_JSON, 'utf8')); }
  catch { return []; }
}
function saveGifts(gifts) {
  fs.writeFileSync(GIFTS_JSON, JSON.stringify(gifts, null, 2), 'utf8');
}

function loadLetters() {
  if (!fs.existsSync(LETTERS_JSON)) return [];
  try { return JSON.parse(fs.readFileSync(LETTERS_JSON, 'utf8')); }
  catch { return []; }
}

function saveLetters(letters) {
  fs.writeFileSync(LETTERS_JSON, JSON.stringify(letters, null, 2), 'utf8');
}

function inferImageExtFromDataUrl(dataUrl) {
  const matched = /^data:image\/(\w+);base64,/.exec(dataUrl || '');
  const ext = (matched?.[1] || 'jpg').toLowerCase();
  if (ext === 'jpeg') return 'jpg';
  if (['jpg', 'png', 'webp'].includes(ext)) return ext;
  return 'jpg';
}

/* ─────────────────── API ROUTES ─────────────────── */

/* GET /api/health – health check endpoint for deploy platforms */
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'graduation-invite-api' });
});

/* GET / – simple root health for backend-only deploy */
app.get('/', (_req, res) => {
  res.status(200).json({ ok: true, message: 'Graduation Invite API is running' });
});

/* POST /api/gift – receive a gift */
app.post('/api/gift', (req, res) => {
  const { recipient, bouquet, bouquetLayout, photo, timestamp } = req.body;

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
    bouquetLayout: Array.isArray(bouquetLayout)
      ? bouquetLayout.slice(0, 40).map(item => ({
          id: String(item?.id || ''),
          name: String(item?.name || '').slice(0, 80),
          group: String(item?.group || 'flower').slice(0, 30),
          x: Number(item?.x ?? 50),
          y: Number(item?.y ?? 40),
          rotation: Number(item?.rotation ?? 0),
          scale: Number(item?.scale ?? 1),
          svg: String(item?.svg || '').slice(0, 3000)
        }))
      : [],
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

/* POST /api/letters – upload and create a personal letter link */
app.post('/api/letters', (req, res) => {
  const { recipient, letterImage } = req.body;

  if (typeof recipient !== 'string' || !recipient.trim()) {
    return res.status(400).json({ ok: false, error: 'Invalid recipient' });
  }
  if (typeof letterImage !== 'string' || !letterImage.startsWith('data:image')) {
    return res.status(400).json({ ok: false, error: 'Invalid letter image' });
  }

  const id = Date.now();
  const base64 = letterImage.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(base64, 'base64');
  const MAX_LETTER_BYTES = 10 * 1024 * 1024; // 10 MB
  if (buf.length < 500 || buf.length > MAX_LETTER_BYTES) {
    return res.status(400).json({ ok: false, error: 'Letter image size out of range' });
  }

  const ext = inferImageExtFromDataUrl(letterImage);
  const letterFile = `letter_${id}.${ext}`;

  try {
    fs.writeFileSync(path.join(LETTERS_DIR, letterFile), buf);
  } catch (e) {
    return res.status(500).json({ ok: false, error: `Cannot save image: ${e.message}` });
  }

  const cleanRecipient = String(recipient).trim().slice(0, 100);
  const letters = loadLetters();
  const letter = {
    id,
    recipient: cleanRecipient,
    letterFile,
    createdAt: new Date().toISOString()
  };

  letters.unshift(letter);
  saveLetters(letters);

  const link = `/?to=${encodeURIComponent(cleanRecipient)}&lid=${id}`;
  res.json({ ok: true, letter, link });
});

/* GET /api/letters – list all personal letter links */
app.get('/api/letters', (_req, res) => {
  res.json(loadLetters());
});

/* GET /api/letters/:id – resolve letter by id (for Envelope) */
app.get('/api/letters/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: 'Invalid id' });

  const letter = loadLetters().find(item => item.id === id);
  if (!letter) return res.status(404).json({ ok: false, error: 'Letter not found' });

  res.json({ ok: true, letter });
});

/* DELETE /api/letters/:id – remove personal letter link and image */
app.delete('/api/letters/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: 'Invalid id' });

  let letters = loadLetters();
  const letter = letters.find(item => item.id === id);
  if (!letter) return res.status(404).json({ ok: false, error: 'Letter not found' });

  if (letter.letterFile) {
    const fp = path.join(LETTERS_DIR, letter.letterFile);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }

  letters = letters.filter(item => item.id !== id);
  saveLetters(letters);
  res.json({ ok: true });
});

function startServer(port) {
  app.listen(port, () => {
    console.log('');
    console.log('🎓 Graduation Invite API');
    console.log(`Running on port ${port}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
  });
}

startServer(process.env.PORT || 3001);
