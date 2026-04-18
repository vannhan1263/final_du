require('dotenv').config();
const dns      = require('dns');
// Force Node.js to use Google DNS for SRV resolution (fixes Windows querySrv ECONNREFUSED).
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});
const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const cors     = require('cors');
const morgan   = require('morgan');
const helmet   = require('helmet');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');

const app      = express();
const PORT     = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/graduation_invite';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || undefined;
const REQUIRE_MONGO = String(process.env.REQUIRE_MONGO || 'true').toLowerCase() !== 'false';
const ALLOW_LOCAL_IMAGE_FALLBACK = String(process.env.ALLOW_LOCAL_IMAGE_FALLBACK || 'false').toLowerCase() === 'true';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const GIFTS_DIR  = path.join(__dirname, 'gifts');
const LETTERS_DIR  = path.join(__dirname, 'letters');
const GIFTS_JSON_PATH = path.join(GIFTS_DIR, 'gifts.json');
const LETTERS_JSON_PATH = path.join(LETTERS_DIR, 'letters.json');

let isMongoReady = false;
let storageMode = 'local-json';

const cloudinaryEnabled = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });
}

/* ── Security headers ── */
app.use(helmet({
  contentSecurityPolicy: false,      // React + inline styles need this
  crossOriginEmbedderPolicy: false
}));

/* ── HTTP logging ── */
app.use(morgan('dev'));

/* ── CORS ── */
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://final-du-beta.vercel.app',
  'https://www.minhchausgraduation.online',
  'https://minhchausgraduation.online'
];

const normalizeOrigin = (value = '') => value.trim().replace(/\/+$/, '');

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = [...new Set([
  ...defaultAllowedOrigins,
  ...envAllowedOrigins
].map(normalizeOrigin).filter(Boolean))];

const previewOriginPatterns = [
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i
];

function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalizedOrigin)) return true;
  return previewOriginPatterns.some(pattern => pattern.test(normalizedOrigin));
}

app.use(cors({
  origin: (origin, cb) => {
    if (isOriginAllowed(origin)) return cb(null, true);

    const err = new Error(`Not allowed by CORS: ${origin}`);
    err.status = 403;
    return cb(err);
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

/* ── MongoDB models ── */
const bouquetItemSchema = new mongoose.Schema({
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  group: { type: String, default: 'flower' },
  x: { type: Number, default: 50 },
  y: { type: Number, default: 40 },
  rotation: { type: Number, default: 0 },
  scale: { type: Number, default: 1 },
  svg: { type: String, default: '' }
}, { _id: false });

const giftSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  recipient: { type: String, required: true, maxlength: 100 },
  bouquet: { type: String, default: '', maxlength: 500 },
  bouquetLayout: { type: [bouquetItemSchema], default: [] },
  photoFile: { type: String, default: null },
  photoUrl: { type: String, default: null },
  photoPublicId: { type: String, default: null },
  timestamp: { type: String, required: true, maxlength: 50 },
  createdAt: { type: String, required: true }
}, { versionKey: false });

const letterSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  recipient: { type: String, required: true, maxlength: 100 },
  letterFile: { type: String, default: null },
  letterUrl: { type: String, default: null },
  letterPublicId: { type: String, default: null },
  createdAt: { type: String, required: true }
}, { versionKey: false });

const Gift = mongoose.model('Gift', giftSchema);
const Letter = mongoose.model('Letter', letterSchema);

/* ── Helpers ── */
function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeBouquetLayout(bouquetLayout) {
  if (!Array.isArray(bouquetLayout)) return [];

  return bouquetLayout.slice(0, 40).map(item => ({
    id: String(item?.id || ''),
    name: String(item?.name || '').slice(0, 80),
    group: String(item?.group || 'flower').slice(0, 30),
    x: safeNumber(item?.x, 50),
    y: safeNumber(item?.y, 40),
    rotation: safeNumber(item?.rotation, 0),
    scale: safeNumber(item?.scale, 1),
    svg: String(item?.svg || '').slice(0, 3000)
  }));
}

function generateNumericId() {
  return (Date.now() * 1000) + Math.floor(Math.random() * 1000);
}

function ensureJsonFile(filePath) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf8');
}

function readJsonArray(filePath) {
  ensureJsonFile(filePath);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function writeJsonArray(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

async function createGiftRecord(gift) {
  if (isMongoReady) {
    await Gift.create(gift);
    return;
  }

  const gifts = readJsonArray(GIFTS_JSON_PATH);
  gifts.push(gift);
  writeJsonArray(GIFTS_JSON_PATH, gifts);
}

async function listGiftRecords() {
  if (isMongoReady) {
    return Gift.find({}).sort({ id: -1 }).lean();
  }

  const gifts = readJsonArray(GIFTS_JSON_PATH);
  return gifts.sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
}

async function deleteGiftRecordById(id) {
  if (isMongoReady) {
    return Gift.findOneAndDelete({ id }).lean();
  }

  const gifts = readJsonArray(GIFTS_JSON_PATH);
  const idx = gifts.findIndex(g => Number(g?.id) === Number(id));
  if (idx < 0) return null;

  const [deleted] = gifts.splice(idx, 1);
  writeJsonArray(GIFTS_JSON_PATH, gifts);
  return deleted;
}

async function createLetterRecord(letter) {
  if (isMongoReady) {
    await Letter.create(letter);
    return;
  }

  const letters = readJsonArray(LETTERS_JSON_PATH);
  letters.push(letter);
  writeJsonArray(LETTERS_JSON_PATH, letters);
}

async function listLetterRecords() {
  if (isMongoReady) {
    return Letter.find({}).sort({ id: -1 }).lean();
  }

  const letters = readJsonArray(LETTERS_JSON_PATH);
  return letters.sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
}

async function findLetterRecordById(id) {
  if (isMongoReady) {
    return Letter.findOne({ id }).lean();
  }

  const letters = readJsonArray(LETTERS_JSON_PATH);
  return letters.find(l => Number(l?.id) === Number(id)) || null;
}

async function deleteLetterRecordById(id) {
  if (isMongoReady) {
    return Letter.findOneAndDelete({ id }).lean();
  }

  const letters = readJsonArray(LETTERS_JSON_PATH);
  const idx = letters.findIndex(l => Number(l?.id) === Number(id));
  if (idx < 0) return null;

  const [deleted] = letters.splice(idx, 1);
  writeJsonArray(LETTERS_JSON_PATH, letters);
  return deleted;
}

async function connectDatabase() {
  await mongoose.connect(MONGO_URI, {
    dbName: MONGO_DB_NAME,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    family: 4,       // Force IPv4 – avoids DNS SRV failures on Windows
    autoIndex: true
  });

  // Ensure collections and indexes exist on first run.
  await Gift.createCollection().catch(() => {});
  await Letter.createCollection().catch(() => {});
  await Gift.collection.createIndex({ id: 1 }, { unique: true });
  await Letter.collection.createIndex({ id: 1 }, { unique: true });
}

function inferImageExtFromDataUrl(dataUrl) {
  const matched = /^data:image\/(\w+);base64,/.exec(dataUrl || '');
  const ext = (matched?.[1] || 'jpg').toLowerCase();
  if (ext === 'jpeg') return 'jpg';
  if (['jpg', 'png', 'webp'].includes(ext)) return ext;
  return 'jpg';
}

async function uploadImage(dataUrl, folder, id, prefix) {
  if (cloudinaryEnabled) {
    try {
      const ext = inferImageExtFromDataUrl(dataUrl);
      const uploadResult = await cloudinary.uploader.upload(dataUrl, {
        folder,
        public_id: `${prefix}_${id}`,
        resource_type: 'image',
        format: ext,
        overwrite: true
      });

      return {
        fileName: null,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        storage: 'cloudinary'
      };
    } catch (err) {
      if (!ALLOW_LOCAL_IMAGE_FALLBACK) {
        throw new Error(`Cloudinary upload failed: ${err.message}`);
      }

      // Optional fallback for temporary local development only.
      console.error('Cloudinary upload failed, falling back to local storage:', err.message);
    }
  } else if (!ALLOW_LOCAL_IMAGE_FALLBACK) {
    throw new Error('Cloudinary is not configured and local image fallback is disabled');
  }

  const ext = inferImageExtFromDataUrl(dataUrl);
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(base64, 'base64');
  const fileName = `${prefix}_${id}.${ext}`;

  const targetDir = prefix === 'gift' ? GIFTS_DIR : LETTERS_DIR;
  fs.writeFileSync(path.join(targetDir, fileName), buf);

  return {
    fileName,
    url: null,
    publicId: null,
    storage: 'local'
  };
}

async function removeCloudinaryAsset(publicId) {
  if (!cloudinaryEnabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message);
  }
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
app.post('/api/gift', async (req, res, next) => {
  try {
    const { recipient, bouquet, bouquetLayout, photo, timestamp } = req.body;

    // Input validation
    if (typeof recipient !== 'string') return res.status(400).json({ ok: false, error: 'Invalid recipient' });

    const id = generateNumericId();
    let photoFile = null;
    let photoUrl = null;
    let photoPublicId = null;

    if (photo && typeof photo === 'string' && photo.startsWith('data:image')) {
      const base64 = photo.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(base64, 'base64');
      const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB
      if (buf.length > 500 && buf.length <= MAX_PHOTO_BYTES) {
        try {
          const stored = await uploadImage(photo, 'graduation-invite/gifts', id, 'gift');
          photoFile = stored.fileName;
          photoUrl = stored.url;
          photoPublicId = stored.publicId;

          if (stored.storage === 'cloudinary') {
            console.log(`  ☁️  Uploaded gift photo: ${photoPublicId}`);
          } else {
            console.log(`  💾  Saved photo: ${photoFile} (${(buf.length / 1024).toFixed(0)} KB)`);
          }
        } catch (e) {
          return res.status(502).json({ ok: false, error: `Cannot save photo: ${e.message}` });
        }
      }
    }

    const gift = {
      id,
      recipient: String(recipient || 'Khách').slice(0, 100),
      bouquet: String(bouquet || '').slice(0, 500),
      bouquetLayout: sanitizeBouquetLayout(bouquetLayout),
      photoFile,
      photoUrl,
      photoPublicId,
      timestamp: String(timestamp || new Date().toLocaleString('vi-VN')).slice(0, 50),
      createdAt: new Date().toISOString()
    };

    await createGiftRecord(gift);

    console.log(`  🎁  Gift from "${gift.recipient}" | ${gift.timestamp}`);
    res.json({ ok: true, id });
  } catch (err) {
    next(err);
  }
});

/* GET /api/gifts – list all gifts (admin) */
app.get('/api/gifts', async (_req, res, next) => {
  try {
    const gifts = await listGiftRecords();
    res.json(gifts);
  } catch (err) {
    next(err);
  }
});

/* DELETE /api/gifts/:id – remove a gift (admin) */
app.delete('/api/gifts/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ ok: false, error: 'Invalid id' });

    const gift = await deleteGiftRecordById(id);
    if (gift?.photoPublicId) {
      await removeCloudinaryAsset(gift.photoPublicId);
    }
    if (gift?.photoFile) {
      const fp = path.join(GIFTS_DIR, gift.photoFile);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* POST /api/letters – upload and create a personal letter link */
app.post('/api/letters', async (req, res, next) => {
  try {
    const { recipient, letterImage } = req.body;

    if (typeof recipient !== 'string' || !recipient.trim()) {
      return res.status(400).json({ ok: false, error: 'Invalid recipient' });
    }
    if (typeof letterImage !== 'string' || !letterImage.startsWith('data:image')) {
      return res.status(400).json({ ok: false, error: 'Invalid letter image' });
    }

    const id = generateNumericId();
    const base64 = letterImage.replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(base64, 'base64');
    const MAX_LETTER_BYTES = 10 * 1024 * 1024; // 10 MB
    if (buf.length < 500 || buf.length > MAX_LETTER_BYTES) {
      return res.status(400).json({ ok: false, error: 'Letter image size out of range' });
    }

    let letterFile = null;
    let letterUrl = null;
    let letterPublicId = null;

    try {
      const stored = await uploadImage(letterImage, 'graduation-invite/letters', id, 'letter');
      letterFile = stored.fileName;
      letterUrl = stored.url;
      letterPublicId = stored.publicId;

      if (stored.storage === 'cloudinary') {
        console.log(`  ☁️  Uploaded letter image: ${letterPublicId}`);
      }
    } catch (e) {
      return res.status(500).json({ ok: false, error: `Cannot save image: ${e.message}` });
    }

    const cleanRecipient = String(recipient).trim().slice(0, 100);
    const letter = {
      id,
      recipient: cleanRecipient,
      letterFile,
      letterUrl,
      letterPublicId,
      createdAt: new Date().toISOString()
    };

    await createLetterRecord(letter);

    const link = `/?to=${encodeURIComponent(cleanRecipient)}&lid=${id}`;
    res.json({ ok: true, letter, link });
  } catch (err) {
    next(err);
  }
});

/* GET /api/letters – list all personal letter links */
app.get('/api/letters', async (_req, res, next) => {
  try {
    const letters = await listLetterRecords();
    res.json(letters);
  } catch (err) {
    next(err);
  }
});

/* GET /api/letters/:id – resolve letter by id (for Envelope) */
app.get('/api/letters/:id', async (req, res, next) => {
  try {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: 'Invalid id' });

  const letter = await findLetterRecordById(id);
  if (!letter) return res.status(404).json({ ok: false, error: 'Letter not found' });

  res.json({ ok: true, letter });
  } catch (err) {
    next(err);
  }
});

/* DELETE /api/letters/:id – remove personal letter link and image */
app.delete('/api/letters/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ ok: false, error: 'Invalid id' });

    const letter = await deleteLetterRecordById(id);
    if (!letter) return res.status(404).json({ ok: false, error: 'Letter not found' });

    if (letter.letterPublicId) {
      await removeCloudinaryAsset(letter.letterPublicId);
    }
    if (letter.letterFile) {
      const fp = path.join(LETTERS_DIR, letter.letterFile);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Return a clear status code for blocked origins instead of generic 500.
app.use((err, _req, res, next) => {
  if (!err) return next();
  if (err.message && err.message.startsWith('Not allowed by CORS')) {
    return res.status(err.status || 403).json({ ok: false, error: 'CORS blocked origin' });
  }

  if (err && err.code === 11000) {
    return res.status(409).json({ ok: false, error: 'Duplicate id, please retry' });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({ ok: false, error: 'Internal server error' });

});

function startServer(port) {
  app.listen(port, () => {
    console.log('');
    console.log('🎓 Graduation Invite API');
    console.log(`Running on port ${port}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    if (isMongoReady) {
      console.log(`MongoDB: connected (${mongoose.connection.name || 'unknown-db'})`);
    } else {
      console.log('MongoDB: unavailable (using local JSON storage)');
    }
    console.log(`Storage mode: ${storageMode}`);
    console.log(`Local image fallback: ${ALLOW_LOCAL_IMAGE_FALLBACK ? 'enabled' : 'disabled'}`);
    console.log(`Cloudinary: ${cloudinaryEnabled ? 'enabled' : 'disabled (local fallback)'}`);
    console.log('');
  });
}

async function bootstrap() {
  try {
    await connectDatabase();
    isMongoReady = true;
    storageMode = 'mongo';
  } catch (err) {
    if (REQUIRE_MONGO) {
      console.error('Cannot start server (MongoDB is required):', err.message);
      process.exit(1);
    }

    isMongoReady = false;
    storageMode = 'local-json';
    console.warn('MongoDB connection failed; starting with local JSON storage:', err.message);
  }

  startServer(process.env.PORT || 3001);
}

bootstrap();
