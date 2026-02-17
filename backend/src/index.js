require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { MongoClient, ObjectId } = require('mongodb');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
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
  const clientOpts = { serverSelectionTimeoutMS: 15000 };
  dbClient = new MongoClient(MONGODB_URI, clientOpts);
  try {
    console.log('Connecting to MongoDB (masked):', (MONGODB_URI || '').replace(/(mongodb\+srv:\/\/)[^@]+@/, '$1***@'));
    await dbClient.connect();
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    throw err;
  }
  db = dbClient.db();
  console.log('Connected to MongoDB');
  // Collections
  const users = db.collection('users');
  const songs = db.collection('songs');
  const versions = db.collection('versions');
  const setlists = db.collection('setlists');
  const sessions = db.collection('sessions');
  const purchases = db.collection('purchases');

  // Create indexes
  await songs.createIndex({ title: 'text', artist: 'text' });
  await versions.createIndex({ songId: 1 });
  await versions.createIndex({ monetized: 1 });
  await versions.createIndex({ teacherId: 1 });
  await purchases.createIndex({ userId: 1 });
  await purchases.createIndex({ versionId: 1 });
  await purchases.createIndex({ teacherId: 1 });

  // Health check
  app.get('/health', (req, res) => res.json({ ok: true }));
  app.get('/', (req, res) => res.json({ ok: true, service: 'Muses API' }));

  // ========== AUTH ==========
  app.post('/auth/register', async (req, res) => {
    const { email, password, role, resume } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'invalid_input' });
    const requestedRole = role || 'student';
    const existing = await users.findOne({ email });

    if (existing) {
      // If user already exists, allow adding a new role to the same account
      const existingRoles = existing.roles || [existing.role || 'student'];
      if (existingRoles.includes(requestedRole)) {
        return res.status(409).json({ error: 'role_exists', message: `You already have a ${requestedRole} account. Try logging in instead.` });
      }
      // Verify password matches the existing account
      const bcrypt = require('bcryptjs');
      const ok = await bcrypt.compare(password, existing.password);
      if (!ok) return res.status(401).json({ error: 'invalid_credentials', message: 'An account with this email exists. Enter your current password to add the new role.' });
      // Add the new role
      const updatedRoles = [...existingRoles, requestedRole];
      const update = { $set: { roles: updatedRoles } };
      if (requestedRole === 'teacher' && resume) update.$set.resume = resume;
      await users.updateOne({ _id: existing._id }, update);
      return res.json({ id: existing._id, email, role: requestedRole, roles: updatedRoles, addedRole: true });
    }

    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const verifyToken = require('crypto').randomBytes(24).toString('hex');
    const userData = { 
      email, 
      password: hashed, 
      roles: [requestedRole],
      role: requestedRole, // keep for backward compat
      resume: resume || null,
      verified: true,
      createdAt: new Date(), 
      verifyToken 
    };
    const result = await users.insertOne(userData);
    const resp = { id: result.insertedId, email, role: userData.role, roles: userData.roles };

    if (sgMail && process.env.EMAIL_FROM) {
      const verifyUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/verify?token=${verifyToken}`;
      try {
        await sgMail.send({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: 'Muses Account Verification',
          text: `Verify your account: ${verifyUrl}`,
          html: `<p>Verify your account: <a href="${verifyUrl}">${verifyUrl}</a></p>`
        });
      } catch (e) {
        console.warn('sendgrid error', e.message);
      }
    } else if (process.env.NODE_ENV !== 'production') {
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
    if (!u) return res.json({ ok: true });
    const token = require('crypto').randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await users.updateOne({ _id: u._id }, { $set: { resetToken: token, resetExpires: expires } });

    if (sgMail && process.env.EMAIL_FROM) {
      const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset?token=${token}`;
      try {
        await sgMail.send({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: 'Muses Password Reset',
          text: `Reset password: ${resetUrl}`,
          html: `<p>Reset password: <a href="${resetUrl}">${resetUrl}</a></p>`
        });
      } catch (e) {
        console.warn('sendgrid error', e.message);
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
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    await users.updateOne({ _id: u._id }, { $set: { password: hashed }, $unset: { resetToken: '', resetExpires: '' } });
    return res.json({ ok: true });
  });
  app.post('/auth/login', async (req, res) => {
    const { email, password, role: requestedRole } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'invalid_input' });
    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const bcrypt = require('bcryptjs');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    // Support both legacy single role and new roles array
    const userRoles = user.roles || [user.role || 'student'];
    // If caller specified a role, check it exists in user's roles
    if (requestedRole && !userRoles.includes(requestedRole)) {
      if (requestedRole === 'teacher') {
        return res.status(403).json({ error: 'no_teacher_account', message: 'No teacher account found for this email. Register as a teacher first, or login as a student.' });
      } else {
        return res.status(403).json({ error: 'no_student_account', message: 'No student account found for this email. Register as a student first, or login as a teacher.' });
      }
    }
    const loginRole = requestedRole || userRoles[0];
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ sub: String(user._id), email: user.email, role: loginRole }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, role: loginRole, roles: userRoles });
  });
  // JWT middleware
  const jwt = require('jsonwebtoken');
  function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'missing_token' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'invalid_token' });
    try {
      const data = jwt.verify(parts[1], JWT_SECRET);
      req.user = data;
      next();
    } catch (e) {
      return res.status(401).json({ error: 'invalid_token' });
    }
  }

  // Optional auth — attaches user if token present, but doesn't require it
  function optionalAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return next();
    const parts = auth.split(' ');
    if (parts.length !== 2) return next();
    try {
      req.user = jwt.verify(parts[1], JWT_SECRET);
    } catch (_) { /* ignore bad tokens */ }
    next();
  }
  app.get('/api/me', authMiddleware, async (req, res) => {
    // Fetch fresh roles from DB in case they were updated after token was issued
    const user = await users.findOne({ _id: new ObjectId(req.user.sub) });
    const roles = user ? (user.roles || [user.role || 'student']) : [req.user.role];
    res.json({ id: req.user.sub, email: req.user.email, role: req.user.role, roles });
  });

  // ========== SONGS (public catalog) ==========
  // Search songs (public)
  app.get('/api/songs/search', async (req, res) => {
    const { q } = req.query;
    let query = {};
    if (q && q.trim()) {
      query = { $text: { $search: q } };
    }
    const list = await songs.find(query).limit(50).toArray();
    res.json(list);
  });

  // Get single song with non-monetized versions
  app.get('/api/songs/:id', async (req, res) => {
    try {
      const song = await songs.findOne({ _id: new ObjectId(req.params.id) });
      if (!song) return res.status(404).json({ error: 'not_found' });
      const vers = await versions.find({ songId: String(song._id), monetized: { $ne: true } }).toArray();
      res.json({ ...song, versions: vers });
    } catch (e) {
      return res.status(400).json({ error: 'invalid_id' });
    }
  });

  // Get a specific version
  app.get('/api/versions/:id', async (req, res) => {
    try {
      const ver = await versions.findOne({ _id: new ObjectId(req.params.id), monetized: { $ne: true } });
      if (!ver) return res.status(404).json({ error: 'not_found' });
      const song = await songs.findOne({ _id: new ObjectId(ver.songId) });
      res.json({ ...ver, song });
    } catch (e) {
      return res.status(400).json({ error: 'invalid_id' });    }
  });

  // ========== BROWSE LESSONS (student discovery) ==========
  // Returns monetized lessons with song info, teacher info, and purchase status
  app.get('/api/lessons/browse', optionalAuth, async (req, res) => {
    try {
      const { q, key, minPrice, maxPrice, sort } = req.query;

      // Build version filter: only monetized lessons
      const vFilter = { monetized: true };
      if (key) vFilter.key = key;
      if (minPrice || maxPrice) {
        vFilter.price = {};
        if (minPrice) vFilter.price.$gte = parseFloat(minPrice);
        if (maxPrice) vFilter.price.$lte = parseFloat(maxPrice);
      }

      // If text search query, first find matching song IDs
      let songIdFilter = null;
      if (q && q.trim()) {
        const matchingSongs = await songs.find({ $text: { $search: q } }).project({ _id: 1 }).toArray();
        songIdFilter = matchingSongs.map(s => String(s._id));
        // Also match teacher name
        vFilter.$or = [
          { songId: { $in: songIdFilter } },
          { teacherName: { $regex: q.trim(), $options: 'i' } }
        ];
      }

      // Determine sort order
      let sortOpt = { createdAt: -1 }; // default: newest
      if (sort === 'price_asc') sortOpt = { price: 1 };
      else if (sort === 'price_desc') sortOpt = { price: -1 };
      else if (sort === 'rating') sortOpt = { rating: -1 };

      const lessonVersions = await versions.find(vFilter).sort(sortOpt).limit(100).toArray();

      if (lessonVersions.length === 0) return res.json([]);

      // Attach song info
      const songIds = [...new Set(lessonVersions.map(v => v.songId))];
      const songList = await songs.find({ _id: { $in: songIds.map(id => new ObjectId(id)) } }).toArray();
      const songMap = {};
      songList.forEach(s => { songMap[String(s._id)] = s; });

      // Check purchase status if user is authenticated
      let purchasedSet = new Set();
      if (req.user) {
        const userPurchases = await purchases.find({ userId: req.user.sub }).toArray();
        userPurchases.forEach(p => purchasedSet.add(p.versionId));
      }

      const result = lessonVersions.map(v => ({
        _id: v._id,
        songId: v.songId,
        teacherId: v.teacherId,
        teacherName: v.teacherName,
        key: v.key,
        keyQuality: v.keyQuality || 'major',
        bpm: v.bpm,
        capo: v.capo,
        timeSignature: v.timeSignature,
        rating: v.rating,
        ratingCount: v.ratingCount,
        monetized: true,
        price: v.price || 0,
        createdAt: v.createdAt,
        song: songMap[v.songId] || null,
        purchased: purchasedSet.has(String(v._id))
        // Note: content/blocks intentionally omitted — must purchase or use /full endpoint
      }));

      res.json(result);
    } catch (e) {
      console.error('browse lessons error', e);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // ========== TEACHER: Create/update songs & versions ==========
  // Create song (teacher only)
  app.post('/api/songs', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'teachers_only' });
    const { title, artist } = req.body;
    if (!title) return res.status(400).json({ error: 'title_required' });
    const result = await songs.insertOne({ 
      title, 
      artist: artist || '', 
      createdBy: req.user.sub,
      createdAt: new Date() 
    });
    res.json({ id: result.insertedId });
  });

  // Update song metadata (teacher only, must have a version for this song)
  app.put('/api/songs/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'teachers_only' });
    try {
      const song = await songs.findOne({ _id: new ObjectId(req.params.id) });
      if (!song) return res.status(404).json({ error: 'not_found' });
      
      // Check if teacher has a version for this song
      const hasVersion = await versions.findOne({ songId: req.params.id, teacherId: req.user.sub });
      if (!hasVersion && song.createdBy !== req.user.sub) {
        return res.status(403).json({ error: 'not_authorized' });
      }
      
      const { title, artist } = req.body;
      const updateData = {
        ...(title !== undefined && { title }),
        ...(artist !== undefined && { artist }),
        updatedAt: new Date()
      };
      
      await songs.updateOne({ _id: song._id }, { $set: updateData });
      res.json({ ok: true });
    } catch (e) {
      return res.status(400).json({ error: 'invalid_id' });
    }
  });
  // Create version for a song (teacher only)
  app.post('/api/songs/:songId/versions', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'teachers_only' });
    const { songId } = req.params;    const { content, key, keyQuality, bpm, capo, timeSignature, backingTrackUrl, youtubeUrl, blocks, monetized, price } = req.body;
    // blocks: [{ type: 'lyrics'|'tabs', beatStart, beatEnd, data }]
    const user = await users.findOne({ _id: new ObjectId(req.user.sub) });
    const versionData = {
      songId,
      teacherId: req.user.sub,
      teacherName: user?.email || 'Unknown',
      content: content || '',
      key: key || 'C',
      keyQuality: keyQuality || 'major',
      bpm: bpm || 120,
      capo: capo || 0,
      timeSignature: timeSignature || '4/4',
      backingTrackUrl: backingTrackUrl || null,
      youtubeUrl: youtubeUrl || null,
      blocks: blocks || [],
      rating: 0,
      ratingCount: 0,
      monetized: monetized || false,
      price: price || 0,
      createdAt: new Date()
    };
    const result = await versions.insertOne(versionData);
    res.json({ id: result.insertedId });
  });

  // Rate a version (authenticated)
  app.post('/api/versions/:id/rate', authMiddleware, async (req, res) => {
    const { rating } = req.body;
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'invalid_rating' });
    }
    try {
      const ver = await versions.findOne({ _id: new ObjectId(req.params.id) });
      if (!ver) return res.status(404).json({ error: 'not_found' });
      // Simple average update (in production, track per-user ratings)
      const newCount = (ver.ratingCount || 0) + 1;
      const newRating = Math.round((((ver.rating || 0) * (ver.ratingCount || 0)) + rating) / newCount * 100) / 100;
      await versions.updateOne({ _id: ver._id }, { $set: { rating: newRating, ratingCount: newCount } });
      res.json({ rating: newRating, ratingCount: newCount });
    } catch (e) {
      return res.status(400).json({ error: 'invalid_id' });
    }
  });

  // ========== TEACHER: My Lessons ==========
  // Get all lessons created by the current teacher
  app.get('/api/my-lessons', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'teachers_only' });
    try {
      const myVersions = await versions.find({ teacherId: req.user.sub }).toArray();
      // Attach song info to each version
      const songIds = [...new Set(myVersions.map(v => v.songId))];
      const songList = await songs.find({ _id: { $in: songIds.map(id => new ObjectId(id)) } }).toArray();
      const songMap = {};
      songList.forEach(s => { songMap[String(s._id)] = s; });
      const result = myVersions.map(v => ({
        ...v,
        song: songMap[v.songId] || null
      }));
      res.json(result);
    } catch (e) {
      console.error('my-lessons error', e);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // Update a lesson version (teacher only, own lessons)
  app.put('/api/versions/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'teachers_only' });
    try {
      const ver = await versions.findOne({ _id: new ObjectId(req.params.id) });
      if (!ver) return res.status(404).json({ error: 'not_found' });
      if (ver.teacherId !== req.user.sub) return res.status(403).json({ error: 'not_owner' });
        const { content, key, keyQuality, bpm, capo, timeSignature, backingTrackUrl, youtubeUrl, blocks, monetized, price } = req.body;
      const updateData = {
        ...(content !== undefined && { content }),
        ...(key !== undefined && { key }),
        ...(keyQuality !== undefined && { keyQuality }),
        ...(bpm !== undefined && { bpm }),
        ...(capo !== undefined && { capo }),
        ...(timeSignature !== undefined && { timeSignature }),
        ...(backingTrackUrl !== undefined && { backingTrackUrl }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
        ...(blocks !== undefined && { blocks }),
        ...(monetized !== undefined && { monetized }),
        ...(price !== undefined && { price }),
        updatedAt: new Date()
      };
      
      await versions.updateOne({ _id: ver._id }, { $set: updateData });
      res.json({ ok: true, id: ver._id });
    } catch (e) {
      console.error('update version error', e);
      return res.status(400).json({ error: 'invalid_id' });
    }
  });

  // Delete a lesson version (teacher only, own lessons)
  app.delete('/api/versions/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'teachers_only' });
    try {
      const ver = await versions.findOne({ _id: new ObjectId(req.params.id) });
      if (!ver) return res.status(404).json({ error: 'not_found' });
      if (ver.teacherId !== req.user.sub) return res.status(403).json({ error: 'not_owner' });
      
      await versions.deleteOne({ _id: ver._id });
      res.json({ ok: true });
    } catch (e) {
      return res.status(400).json({ error: 'invalid_id' });
    }
  });
  // ========== PURCHASES ==========
  // Get student's purchased lessons
  app.get('/api/my-purchases', authMiddleware, async (req, res) => {
    try {
      const myPurchases = await purchases.find({ userId: req.user.sub }).toArray();
      
      if (myPurchases.length === 0) return res.json([]);
      
      // Get the purchased versions
      const versionIds = myPurchases.map(p => new ObjectId(p.versionId));
      const purchasedVersions = await versions.find({ _id: { $in: versionIds } }).toArray();
      
      // Attach song info
      const songIds = [...new Set(purchasedVersions.map(v => v.songId))];
      const songList = await songs.find({ _id: { $in: songIds.map(id => new ObjectId(id)) } }).toArray();
      const songMap = {};
      songList.forEach(s => { songMap[String(s._id)] = s; });
      
      const result = purchasedVersions.map(v => ({
        ...v,
        song: songMap[v.songId] || null,
        purchasedAt: myPurchases.find(p => p.versionId === String(v._id))?.purchasedAt
      }));
      res.json(result);
    } catch (e) {
      console.error('my-purchases error', e);
      return res.status(500).json({ error: 'server_error' });
    }
  });
  // Purchase a monetized lesson (simplified - no real payment)
  app.post('/api/purchase/:versionId', authMiddleware, async (req, res) => {
    try {
      const versionId = req.params.versionId;
      
      // Check if version exists and is monetized
      const ver = await versions.findOne({ _id: new ObjectId(versionId) });
      if (!ver) return res.status(404).json({ error: 'not_found' });
      if (!ver.monetized) return res.status(400).json({ error: 'not_monetized' });
      
      // Check if already purchased
      const existing = await purchases.findOne({ userId: req.user.sub, versionId });
      if (existing) return res.status(400).json({ error: 'already_purchased' });
      
      // Create purchase record (in production, integrate with Stripe/payment processor)
      await purchases.insertOne({
        userId: req.user.sub,
        versionId,
        teacherId: ver.teacherId,
        price: ver.price || 0,
        purchasedAt: new Date()
      });
      
      res.json({ ok: true, versionId });
    } catch (e) {
      console.error('purchase error', e);
      return res.status(400).json({ error: 'invalid_id' });
    }
  });

  // Check if user has access to a version (purchased or free)
  app.get('/api/versions/:id/access', authMiddleware, async (req, res) => {
    try {
      const ver = await versions.findOne({ _id: new ObjectId(req.params.id) });
      if (!ver) return res.status(404).json({ error: 'not_found' });
      
      // Free lessons - everyone has access
      if (!ver.monetized) {
        return res.json({ hasAccess: true, reason: 'free' });
      }
        // Teacher owns it
      if (ver.teacherId === req.user.sub) {
        return res.json({ hasAccess: true, reason: 'owner' });
      }
      
      // Check purchase
      const purchase = await purchases.findOne({ userId: req.user.sub, versionId: req.params.id });
      if (purchase) {
        return res.json({ hasAccess: true, reason: 'purchased' });
      }
      
      return res.json({ hasAccess: false, price: ver.price || 0 });
    } catch (e) {
      return res.status(400).json({ error: 'invalid_id' });
    }
  });

  // Get a specific version (with access check for monetized)
  app.get('/api/versions/:id/full', authMiddleware, async (req, res) => {
    try {
      const ver = await versions.findOne({ _id: new ObjectId(req.params.id) });
      if (!ver) return res.status(404).json({ error: 'not_found' });
        // Check access for monetized content
      if (ver.monetized) {
        const isOwner = ver.teacherId === req.user.sub;
        if (!isOwner) {
          const purchase = await purchases.findOne({ userId: req.user.sub, versionId: req.params.id });
          if (!purchase) {
            // Return limited info (no content)
            const song = await songs.findOne({ _id: new ObjectId(ver.songId) });
            return res.json({
              _id: ver._id,
              songId: ver.songId,
              teacherName: ver.teacherName,
              key: ver.key,
              bpm: ver.bpm,
              rating: ver.rating,
              ratingCount: ver.ratingCount,
              monetized: true,
              price: ver.price || 0,
              hasAccess: false,
              song
            });
          }
        }
      }
      
      const song = await songs.findOne({ _id: new ObjectId(ver.songId) });
      res.json({ ...ver, song, hasAccess: true });
    } catch (e) {
      return res.status(400).json({ error: 'invalid_id' });
    }
  });
  // ========== TEACHER ANALYTICS ==========
  app.get('/api/teacher/stats', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'teachers_only' });
    try {
      // Get my lessons count
      const lessonCount = await versions.countDocuments({ teacherId: req.user.sub });
      
      // Get monetized lessons count
      const monetizedCount = await versions.countDocuments({ teacherId: req.user.sub, monetized: true });
      
      // Get total sales
      const sales = await purchases.find({ teacherId: req.user.sub }).toArray();
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, p) => sum + (p.price || 0), 0);
      
      // Get average rating across all lessons
      const myVersions = await versions.find({ teacherId: req.user.sub, ratingCount: { $gt: 0 } }).toArray();
      let avgRating = 0;
      if (myVersions.length > 0) {
        const totalRating = myVersions.reduce((sum, v) => sum + (v.rating || 0) * (v.ratingCount || 0), 0);
        const totalCount = myVersions.reduce((sum, v) => sum + (v.ratingCount || 0), 0);
        avgRating = totalCount > 0 ? Math.round((totalRating / totalCount) * 100) / 100 : 0;
      }
      
      res.json({
        lessonCount,
        monetizedCount,
        totalSales,
        totalRevenue,
        avgRating
      });
    } catch (e) {
      console.error('teacher stats error', e);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // ========== SETLISTS ==========
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

  // ========== SESSIONS ==========
  app.post('/api/sessions', authMiddleware, async (req, res) => {
    const payload = req.body;
    payload.owner = req.user.sub;
    payload.createdAt = new Date();
    const result = await sessions.insertOne(payload);
    res.json({ id: result.insertedId });
  });

  app.get('/api/sessions', authMiddleware, async (req, res) => {
    const list = await sessions.find({ owner: req.user.sub }).toArray();
    res.json(list);
  });

  app.get('/api/sessions/active', async (req, res) => {
    const list = await sessions.find({}).sort({ updatedAt: -1 }).limit(50).toArray();
    res.json(list);
  });

  // ========== HTTP + WebSocket server ==========
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  // In-memory session storage for live performance sessions
  const liveSessions = new Map(); // code -> { host, participants: Map<ws, {userId, name}>, setlist, songIndex, transpose, ... }

  wss.on('connection', (ws, req) => {
    let userId = null;
    let userEmail = null;
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      if (!token) { ws.close(4001, 'missing_token'); return; }
      const data = jwt.verify(token, JWT_SECRET);
      userId = data.sub;
      userEmail = data.email;
      ws.user = data;
      ws.userId = userId;
    } catch (e) {
      try { ws.close(4002, 'invalid_token'); } catch (err) {}
      return;
    }

    // Track which session this connection is in
    ws.sessionCode = null;

    ws.on('message', async (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        
        // ========== Performance Session Messages ==========
        if (data.type === 'create_session') {
          const code = data.code;
          if (liveSessions.has(code)) {
            ws.send(JSON.stringify({ type: 'error', message: 'Session code already in use' }));
            return;
          }
          
          const session = {
            code,
            host: ws,
            hostId: userId,
            hostEmail: userEmail,
            participants: new Map(),
            setlist: data.setlist,
            songIndex: data.songIndex || 0,
            scrollPosition: 0,
            createdAt: new Date(),
          };
          liveSessions.set(code, session);
          ws.sessionCode = code;
          
          ws.send(JSON.stringify({ 
            type: 'session_created', 
            code,
            participants: [] 
          }));
          console.log(`Session ${code} created by ${userEmail}`);
        }
        
        else if (data.type === 'join_session') {
          const code = data.code?.toUpperCase();
          const session = liveSessions.get(code);
          
          if (!session) {
            ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
            return;
          }
          
          // Add participant
          session.participants.set(ws, { userId, email: userEmail });
          ws.sessionCode = code;
          
          // Get participant list
          const participantList = Array.from(session.participants.values()).map(p => ({ email: p.email }));
          
          // Notify joiner (transpose is NOT synced - each member controls their own)
          ws.send(JSON.stringify({
            type: 'session_joined',
            code,
            participants: participantList,
            setlist: session.setlist,
            songIndex: session.songIndex,
            scrollPosition: session.scrollPosition || 0,
          }));
          
          // Notify host and other participants
          const joinNotification = JSON.stringify({
            type: 'participant_joined',
            email: userEmail,
            participants: participantList,
          });
          
          if (session.host.readyState === WebSocket.OPEN) {
            session.host.send(joinNotification);
          }
          session.participants.forEach((p, clientWs) => {
            if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(joinNotification);
            }
          });
          
          console.log(`${userEmail} joined session ${code}`);
        }
        
        else if (data.type === 'sync_state') {
          const code = data.code;
          const session = liveSessions.get(code);
          
          if (!session) return;
          
          // Only host can sync state
          if (session.hostId !== userId) return;
          
          // Update session state (transpose is NOT synced - each member controls their own)
          if (data.songIndex !== undefined) session.songIndex = data.songIndex;
          if (data.scrollPosition !== undefined) session.scrollPosition = data.scrollPosition;
          if (data.setlist) session.setlist = data.setlist;
          
          // Broadcast to all participants
          const syncMsg = JSON.stringify({
            type: 'sync_state',
            senderId: data.senderId,
            songIndex: session.songIndex,
            scrollPosition: session.scrollPosition,
            setlist: session.setlist,
          });
          
          session.participants.forEach((p, clientWs) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(syncMsg);
            }
          });
        }
        
        else if (data.type === 'leave_session') {
          const code = data.code;
          const session = liveSessions.get(code);
          
          if (!session) return;
          
          // Remove from participants
          session.participants.delete(ws);
          ws.sessionCode = null;
          
          // Notify others
          const participantList = Array.from(session.participants.values()).map(p => ({ email: p.email }));
          const leaveMsg = JSON.stringify({
            type: 'participant_left',
            email: userEmail,
            participants: participantList,
          });
          
          if (session.host.readyState === WebSocket.OPEN) {
            session.host.send(leaveMsg);
          }
          session.participants.forEach((p, clientWs) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(leaveMsg);
            }
          });
          
          console.log(`${userEmail} left session ${code}`);
        }
        
        else if (data.type === 'end_session') {
          const code = data.code;
          const session = liveSessions.get(code);
          
          if (!session) return;
          
          // Only host can end session
          if (session.hostId !== userId) return;
          
          // Notify all participants
          const endMsg = JSON.stringify({ type: 'session_ended' });
          session.participants.forEach((p, clientWs) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(endMsg);
              clientWs.sessionCode = null;
            }
          });
          
          // Remove session
          liveSessions.delete(code);
          ws.sessionCode = null;
          
          console.log(`Session ${code} ended by host`);
        }
        
        // ========== Legacy session:update handling ==========
        else if (data.type === 'session:update') {
          const payload = data.payload || {};
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
          wss.clients.forEach((c) => {
            if (c !== ws && c.readyState === WebSocket.OPEN) c.send(JSON.stringify(data));
          });
        }
      } catch (e) {
        console.warn('invalid ws message', e.message);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      if (ws.sessionCode) {
        const session = liveSessions.get(ws.sessionCode);
        if (session) {
          if (session.hostId === userId) {
            // Host disconnected - end session
            const endMsg = JSON.stringify({ type: 'session_ended' });
            session.participants.forEach((p, clientWs) => {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(endMsg);
                clientWs.sessionCode = null;
              }
            });
            liveSessions.delete(ws.sessionCode);
            console.log(`Session ${ws.sessionCode} ended (host disconnected)`);
          } else {
            // Participant disconnected
            session.participants.delete(ws);
            const participantList = Array.from(session.participants.values()).map(p => ({ email: p.email }));
            const leaveMsg = JSON.stringify({
              type: 'participant_left',
              email: userEmail,
              participants: participantList,
            });
            if (session.host.readyState === WebSocket.OPEN) {
              session.host.send(leaveMsg);
            }
            session.participants.forEach((p, clientWs) => {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(leaveMsg);
              }
            });
            console.log(`${userEmail} disconnected from session ${ws.sessionCode}`);
          }
        }
      }
    });
  });

  server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
