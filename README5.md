# 🔗 SnipURL — Full-Stack Connection Guide

> How the React frontend and Express backend communicate end-to-end.

## Architecture Overview

```
┌────────────────────────┐         ┌───────────────────────┐         ┌──────────────┐
│     React Frontend     │  HTTP   │    Express Backend     │  TCP    │   MongoDB    │
│     localhost:5173      │ ◄─────► │    localhost:5000      │ ◄─────► │   :27017     │
│                        │  JSON   │                       │ Mongoose│              │
└────────────────────────┘         └───────────────────────┘         └──────────────┘
```

## Connection Flow

### 1. Vite Dev Proxy → Express

During development, Vite proxies all `/api` requests to the backend:

```javascript
// client/vite.config.js
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

**Why proxy?** Avoids CORS issues in development. The browser sees all requests going to `localhost:5173`, but Vite forwards `/api/*` to `localhost:5000`.

### 2. React API Layer → Express Routes

```
React Component  →  api.js  →  fetch('/api/url/...')  →  Vite Proxy  →  Express Router
```

**Example: Shortening a URL**

```
1. User types URL in Home.jsx input
2. handleSubmit() calls shortenUrl({ originalUrl }) from api.js
3. api.js sends POST /api/url/shorten with JSON body
4. Vite proxy forwards to Express at localhost:5000
5. Express route validates URL, generates shortId, saves to MongoDB
6. Express returns JSON response
7. api.js parses JSON, returns to Home.jsx
8. Home.jsx updates state → UI shows shortened URL
```

### 3. Express → MongoDB (Mongoose)

```javascript
// server/config/db.js
const conn = await mongoose.connect(process.env.MONGO_URI);
// MONGO_URI = mongodb://localhost:27017/urlshortener
```

Mongoose handles:
- Connection pooling (default 5 connections)
- Auto-reconnection on failure
- Schema validation before writes
- Index creation on startup

### 4. CORS Configuration

```javascript
// server/server.js
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

In production, set `CLIENT_URL` to your deployed frontend URL.

## Request/Response Cycle

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser  │────►│   Vite   │────►│ Express  │────►│ MongoDB  │
│           │     │  Proxy   │     │  Router  │     │          │
│  React    │◄────│          │◄────│  + Model │◄────│          │
│  State    │ JSON│          │ JSON│          │ BSON│          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### Shorten URL Flow
```
POST /api/url/shorten { originalUrl: "https://..." }
  → url.js router validates with valid-url
  → nanoid(8) generates shortId
  → new Url({...}).save() → MongoDB insert
  ← { _id, originalUrl, shortId, clicks: 0, ... }
```

### Redirect Flow
```
GET /aB3xK9mQ
  → server.js catches /:shortId
  → Url.findOne({ shortId }) → MongoDB query (indexed)
  → Check isActive, expiresAt, maxClicks
  → Push to clickDetails[], increment clicks
  → url.save() → MongoDB update
  ← 302 Redirect → Location: https://original-url.com
```

### Analytics Flow
```
GET /api/url/aB3xK9mQ/analytics
  → url.js finds URL by shortId
  → Processes clickDetails[] in-memory:
      • Group by referrer
      • Group by browser (from User-Agent)
      • Group by hour
      • Group by day
  ← { url: {...}, analytics: { referrerStats, browserStats, ... } }
```

## Running the Full Stack

```bash
# Terminal 1 — Start MongoDB
mongod

# Terminal 2 — Start Backend
cd server
cp .env.example .env
npm install
npm run dev          # → http://localhost:5000

# Terminal 3 — Start Frontend
cd client
npm install
npm run dev          # → http://localhost:5173
```

Open `http://localhost:5173` — the frontend will proxy API calls to the backend automatically.

## Environment Variables

### Backend (`server/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

## Production Deployment

For production:
1. Build the React app: `cd client && npm run build`
2. Serve the `dist/` folder from Express (or a CDN)
3. Update `MONGO_URI` to your production MongoDB (e.g., MongoDB Atlas)
4. Update `BASE_URL` and `CLIENT_URL` to production domains

---

## Connect with Me

- 🐙 **GitHub**: [code0era](https://github.com/code0era)
- 💼 **LinkedIn**: [Shubham Yadav](https://www.linkedin.com/in/shubham-yadav-38a467267/)
- 📧 **Email**: ashubhamyadav61@gmail.com
- 🧩 **LeetCode**: [Code0Era](https://leetcode.com/u/Code0Era/)
- 📞 **Phone**: +91-9569768198

**Shubham Yadav** • B.Tech CS, IIIT Kalyani (2026) • 8.28 CGPA

---

*No third-party API keys required. Just MongoDB, Node.js, and npm.*
