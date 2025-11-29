# Smart Public Transportation System — DT Assignment

A responsive multi-page website + backend demonstrating a modern public transportation system for a rapidly growing city.

**Tech stack:** Node.js, Express, SQLite, Bootstrap.

---

## 🔎 Project Overview

This project is a college assignment / demo showcasing:
- Multi-page, responsive frontend built with **Bootstrap** (`public/*.html`).
- Backend API and server built with **Express** (`server.js`).
- Lightweight **SQLite** database (`contacts.db`) to store contact form submissions.
- Simple Admin page to view contact submissions (`public/admin.html`).

Pages included:
- `index.html` — Home / overview  
- `problem.html` — Problem statement  
- `system.html` — Proposed system / modules  
- `benefits.html` — Benefits & outcomes  
- `contact.html` — Contact form (submits to backend)  
- `admin.html` — View submitted messages (for demo; add auth for production)

---

## 🚀 Quick Start (Run locally)

### Requirements
- Node.js (v16+ recommended)
- npm (comes with Node.js)

### Steps
1. Clone the repo:
   ```bash
   git clone https://github.com/ApurveKaranwal/DT_Assignment.git
   cd DT_Assignment
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. Open the site:
   ```bash
   http://localhost:3000
   ```
---

## 🧩 Project Structure
```bash
DT_Assignment/
├─ server.js
├─ package.json
├─ contacts.db (auto-created)
├─ public/
│  ├─ index.html
│  ├─ problem.html
│  ├─ system.html
│  ├─ benefits.html
│  ├─ contact.html
│  ├─ admin.html
│  └─ css/style.css
└─ README.md
```
---

## 🗄 Database:
- Uses SQLite file contacts.db at project root.
- Table contacts stores: id, name, email, message, created_at.
- Use DB Browser for SQLite or the sqlite3 CLI to inspect/edit.

## ✍️ Author
Apurve Karanwal — DT Assignment

## Live Website link
```bash
https://dt-assignment.onrender.com/
```
