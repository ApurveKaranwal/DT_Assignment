const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURATION ---
// Change these credentials to whatever you prefer!
const ADMIN_CREDENTIALS = {
    email: "admin@nexus.com",
    password: "password123" 
};

// Middleware
app.use(cors()); // Allow frontend to communicate without blocks
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE SETUP ---
const DB_PATH = path.join(__dirname, 'contacts.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('❌ CRITICAL ERROR: Could not open database', err);
  else console.log('✅ Database connected successfully');
});

// Create table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`, (err) => {
  if (err) console.error('❌ Table creation failed:', err);
  else console.log('✅ Contacts table ready');
});

// --- SECURITY MIDDLEWARE (The Gatekeeper) ---
const requireAuth = (req, res, next) => {
    const token = req.headers['authorization'];
    // In a real app, use JWT. Here we check a simple static secret key.
    if (token === "NEXUS-ADMIN-SECRET-KEY-99") {
        next(); // Token is correct, allow access
    } else {
        res.status(401).json({ success: false, error: "Unauthorized: Invalid or missing token" });
    }
};

// --- API ROUTES ---

// 1. LOGIN ROUTE (Public)
// Verifies email/pass and returns the "Key" (Token)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        res.json({ success: true, token: "NEXUS-ADMIN-SECRET-KEY-99" });
    } else {
        res.status(401).json({ success: false, error: "Invalid Credentials" });
    }
});

// 2. CONTACTS DATA (PROTECTED)
// Uses 'requireAuth' middleware. Browser must send token to see this.
app.get('/api/contacts', requireAuth, (req, res) => {
    console.log('👀 Admin accessing messages (Authorized)...');
    const limit = parseInt(req.query.limit || '100', 10);
    const sql = `SELECT * FROM contacts ORDER BY created_at DESC LIMIT ?`;
    
    db.all(sql, [limit], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: 'Database read failed.' });
        
        // Prevent browser caching for admin data
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.json({ success: true, data: rows });
    });
});

// 3. SAVE CONTACT FORM (Public)
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body || {};
    
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Missing fields.' });
    }

    const insertSQL = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
    db.run(insertSQL, [name, email, message], function (err) {
        if (err) return res.status(500).json({ success: false, error: 'Database save failed.' });
        
        console.log(`📩 Saved message from: ${name}`);
        return res.json({ success: true, id: this.lastID });
    });
});

// 4. SMART CITY SIMULATION ROUTES (For Dashboard)
// Simulation Data Helpers
const transportLines = [
    { id: 101, name: "Metro Line A (Red)", type: "metro", destination: "Central Station" },
    { id: 102, name: "Metro Line B (Blue)", type: "metro", destination: "Tech Park" },
    { id: 204, name: "Bus Route 42", type: "bus", destination: "North Suburbs" },
    { id: 205, name: "Bus Route 18", type: "bus", destination: "University" },
    { id: 301, name: "Tram Line Z", type: "tram", destination: "Old Town" }
];
let cityStats = { dailyCommuters: 124500, activeVehicles: 412 };

app.get('/api/status', (req, res) => {
    // Generate fresh random status
    const liveData = transportLines.map(line => {
        const statuses = ["On Time", "On Time", "On Time", "Delayed", "Maintenance"];
        const crowds = ["Low", "Moderate", "Moderate", "High", "Overcrowded"];
        return {
            ...line,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            crowd: crowds[Math.floor(Math.random() * crowds.length)],
            nextArrival: (Math.floor(Math.random() * 12) + 1) + " min"
        };
    });
    res.json(liveData);
});

app.get('/api/stats', (req, res) => {
    cityStats.dailyCommuters += Math.floor(Math.random() * 10);
    res.json(cityStats);
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
  🔒 SECURE SERVER RESTARTED & RUNNING
  -----------------------------------------
  👉 URL:        http://localhost:${PORT}
  👉 Admin Page: http://localhost:${PORT}/admin.html
  👉 Login:      ${ADMIN_CREDENTIALS.email} / ${ADMIN_CREDENTIALS.password}
  =========================================
  `);
});