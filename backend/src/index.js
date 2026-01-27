require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { MongoClient } = require('mongodb');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Initialize SendGrid if configured
let sgMail = null;
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid initialized');
  } catch (e) {
    console.warn('SendGrid initialization failed', e.message || e);
    sgMail = null;
  }
}

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Exiting.');
  process.exit(1);
}

let dbClient;
let db;

async function start() {
  // Provide a sensible server selection timeout and log masked host for debugging
  const clientOpts = { serverSelectionTimeoutMS: 15000 };
  dbClient = new MongoClient(MONGODB_URI, clientOpts);
  try {
    console.log('Connecting to MongoDB (masked):', (MONGODB_URI || '').replace(/(mongodb\+srv:\/\/)[^@]+@/, '$1***@'));
    await dbClient.connect();
  } catch (err) {
    console.error('MongoDB connection error. Common causes: Atlas IP access list blocking Render, invalid URI, or TLS handshake issues.');
    console.error('Full error:', err.message || err);
    throw err;
  }
  db = dbClient.db();
  console.log('Connected to MongoDB');

  // Basic health check
  app.get('/health', (req, res) => res.json({ ok: true }));

  // Serve simple root
  app.get('/', (req, res) => res.json({ ok: true, service: 'GuitarBuddy API' }));

  // Auth and API routes (minimal)
  const users = db.collection('users');
  const songs = db.collection('songs');
  const setlists = db.collection('setlists');
  const sessions = db.collection('sessions');

  app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'invalid_input' });
    const existing = await users.findOne({ email });
    if (existing) return res.status(409).json({ error: 'user_exists' });
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(password, 10);
    const verifyToken = require('crypto').randomBytes(24).toString('hex');
    const result = await users.insertOne({ email, password: hashed, createdAt: new Date(), verified: false, verifyToken });
    // In production send email; in dev return token so client can verify
    const resp = { id: result.insertedId, email };

    // If SendGrid configured and EMAIL_FROM present, send verification email
    if (sgMail && process.env.EMAIL_FROM) {
      const verifyUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/verify?token=${verifyToken}`;
      try {
        await sgMail.send({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: 'GuitarBuddy Account Verification',
          text: `Verify your GuitarBuddy account by visiting: ${verifyUrl}\n\nOr use this token: ${verifyToken}`,
          html: `<p>Verify your GuitarBuddy account by clicking <a href="${verifyUrl}">this link</a></p><p>Or use this token: <code>${verifyToken}</code></p>`
        });
      } catch (e) {
        console.warn('sendgrid send error', e.message || e);
      }
    } else if (process.env.NODE_ENV !== 'production') {
      // fallback behavior for development/testing
      resp.verifyToken = verifyToken;
    }

    return res.json(resp);
  });

  app.post('/auth/verify', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'invalid_input' });
    const u = await users.findOneAndUpdate({ verifyToken: token }, { $set: { verified: true }, $unset: { verifyToken: '' } });
    if (!u.value) return res.status(400).json({ error: 'invalid_token' });
    return res.json({ ok: true });
  });

  app.post('/auth/request-reset', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'invalid_input' });
    const u = await users.findOne({ email });
    if (!u) return res.json({ ok: true }); // don't reveal existence
    const token = require('crypto').randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await users.updateOne({ _id: u._id }, { $set: { resetToken: token, resetExpires: expires } });

    // If SendGrid configured send reset email
    if (sgMail && process.env.EMAIL_FROM) {
      const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset?token=${token}`;
      try {
        await sgMail.send({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: 'GuitarBuddy Password Reset',
          text: `Reset your GuitarBuddy password: ${resetUrl}\n\nOr use this token: ${token}`,
          html: `<p>Reset your GuitarBuddy password by clicking <a href="${resetUrl}">this link</a></p><p>Or use this token: <code>${token}</code></p>`
        });
      } catch (e) {
        console.warn('sendgrid send error', e.message || e);
      }
    }

    const resp = { ok: true };
    if (process.env.NODE_ENV !== 'production' && !sgMail) resp.resetToken = token;
    return res.json(resp);
  });

  app.post('/auth/reset', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'invalid_input' });
    const u = await users.findOne({ resetToken: token, resetExpires: { $gt: new Date() } });
    if (!u) return res.status(400).json({ error: 'invalid_token' });
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(password, 10);
    await users.updateOne({ _id: u._id }, { $set: { password: hashed }, $unset: { resetToken: '', resetExpires: '' } });
    return res.json({ ok: true });
  });

  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'invalid_input' });
    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const bcrypt = require('bcrypt');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ sub: String(user._id), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  });

  // Protected helper
  const jwt = require('jsonwebtoken');
  function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'missing_token' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'invalid_token' });
    const token = parts[1];
    try {
      const data = jwt.verify(token, JWT_SECRET);
      req.user = data;
      next();
    } catch (e) {
      return res.status(401).json({ error: 'invalid_token' });
    }
  }

  // CRUD for songs (minimal)
  app.get('/api/songs', authMiddleware, async (req, res) => {
    const list = await songs.find({ owner: req.user.sub }).toArray();
    res.json(list);
  });

  app.post('/api/songs', authMiddleware, async (req, res) => {
    const payload = req.body;
    payload.owner = req.user.sub;
    payload.createdAt = new Date();
    const result = await songs.insertOne(payload);
    res.json({ id: result.insertedId });
  });

  // minimal setlists
  app.get('/api/setlists', authMiddleware, async (req, res) => {
    const list = await setlists.find({ owner: req.user.sub }).toArray();
    res.json(list);
  });

  app.post('/api/setlists', authMiddleware, async (req, res) => {
    const payload = req.body;
    payload.owner = req.user.sub;
    payload.createdAt = new Date();
    const result = await setlists.insertOne(payload);
    res.json({ id: result.insertedId });
  });

  // practice sessions storage
  app.post('/api/sessions', authMiddleware, async (req, res) => {
    const payload = req.body;
    payload.owner = req.user.sub;
    payload.createdAt = new Date();
    const result = await sessions.insertOne(payload);
    res.json({ id: result.insertedId });
  });

  // sessions endpoints
  app.get('/api/sessions', authMiddleware, async (req, res) => {
    const list = await sessions.find({ owner: req.user.sub }).toArray();
    res.json(list);
  });

  // public listing of recent active sessions (read-only)
  app.get('/api/sessions/active', async (req, res) => {
    const list = await sessions.find({}).sort({ updatedAt: -1 }).limit(50).toArray();
    res.json(list);
  });

  // Start HTTP + WebSocket server
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  // expose current user
  app.get('/api/me', authMiddleware, (req, res) => {
    res.json({ id: req.user.sub, email: req.user.email });
  });

  // Authenticate WebSocket connections using ?token=<jwt>
  wss.on('connection', (ws, req) => {
    let userId = null;
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      if (!token) {
        ws.close(4001, 'missing_token');
        return;
      }
      const data = jwt.verify(token, JWT_SECRET);
      userId = data.sub;
      ws.user = data;
    } catch (e) {
      try { ws.close(4002, 'invalid_token') } catch (err) {}
      return;
    }

    ws.on('message', async (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data && data.type === 'session:update') {
          const payload = data.payload || {};
          // persist session minimal state when sessionId present
          if (payload.sessionId) {
            try {
              await sessions.updateOne(
                { sessionId: payload.sessionId },
                { $set: { owner: userId, updatedAt: new Date(), payload } },
                { upsert: true }
              );
            } catch (e) {
              console.warn('session persist error', e.message);
            }
          }

          // broadcast to other clients
          wss.clients.forEach((c) => {
            if (c !== ws && c.readyState === WebSocket.OPEN) c.send(JSON.stringify(data));
          });
        }
      } catch (e) {
        console.warn('invalid ws message', e.message);
      }
    });
  });

  server.listen(PORT, () => console.log(`Server listening ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
