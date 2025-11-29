const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Initialize SQLite database ---
const DB_PATH = path.join(__dirname, 'contacts.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ CRITICAL ERROR: Could not open database', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Create table if not exists
const createTableSQL = `
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.run(createTableSQL, (err) => {
  if (err) console.error('❌ Table creation failed:', err);
  else console.log('✅ Contacts table ready');
});

// --- API routes ---

// Save contact submission
app.post('/api/contact', (req, res) => {
  console.log('📩 Receiving contact form submission...');
  const { name, email, message } = req.body || {};
  
  if (!name || !email || !message) {
    console.log('⚠️ Missing fields in submission');
    return res.status(400).json({ success: false, error: 'Missing name, email, or message.' });
  }

  const insertSQL = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
  db.run(insertSQL, [name, email, message], function (err) {
    if (err) {
      console.error('❌ DB Insert Error:', err);
      return res.status(500).json({ success: false, error: 'Database save failed.' });
    }
    console.log(`✅ Saved message from: ${name}`);
    return res.json({ success: true, id: this.lastID });
  });
});

// Return last N contacts (for admin page)
app.get('/api/contacts', (req, res) => {
  console.log('👀 Admin accessing messages...');
  const limit = parseInt(req.query.limit || '100', 10);
  const sql = `SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC LIMIT ?`;
  
  db.all(sql, [limit], (err, rows) => {
    if (err) {
      console.error('❌ DB Select Error:', err);
      return res.status(500).json({ success: false, error: 'Database read failed.' });
    }
    // Set headers to prevent caching issues
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.json({ success: true, data: rows });
  });
});

// Health check to verify server is alive
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'Server is alive!' });
});

// Fallback: serve index for unknown routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
  =========================================
  🚀 SERVER RESTARTED & RUNNING
  -----------------------------------------
  👉 URL:   http://localhost:${PORT}
  👉 Admin: http://localhost:${PORT}/admin.html
  =========================================
  `);
});