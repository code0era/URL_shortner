

<img width="1920" height="1020" alt="Screenshot 2026-03-28 043743" src="https://github.com/user-attachments/assets/d76d92a1-5795-4511-8357-c179a0a0b023" />

<img width="1920" height="1020" alt="Screenshot 2026-03-28 043752" src="https://github.com/user-attachments/assets/703fb6d6-f806-41d6-bb4d-b7cec87ef6ef" />


# ⚡ SnipURL — URL Shortener | System Design

> A full-stack MERN URL shortener with analytics, QR codes, and custom aliases.

## High-Level Architecture

```
┌──────────────┐     HTTP      ┌──────────────┐      Mongoose      ┌──────────────┐
│   React SPA  │ ◄──────────► │  Express API  │ ◄────────────────► │   MongoDB    │
│  (Vite Dev)  │   REST JSON   │   (Node.js)  │    ODM Queries     │  (Database)  │
│  Port: 5173  │               │  Port: 5000  │                    │  Port: 27017 │
└──────────────┘               └──────────────┘                    └──────────────┘
       │                              │
       │  Vite Proxy /api ──────────► │
       │                              │
       └──── SPA Routing ◄────────────┘  GET /:shortId → 302 Redirect
```

## System Design Principles

### 1. URL Shortening Algorithm
- Uses **nanoid** (8-char alphanumeric) for short IDs — 64^8 = ~281 trillion combinations
- Collision probability is negligible for small-to-medium scale
- Supports custom aliases with uniqueness check via MongoDB unique index

### 2. Data Flow

```
User enters URL → POST /api/url/shorten
  ├── Validate URL (valid-url library)
  ├── Check custom alias uniqueness (if provided)
  ├── Check if already shortened (dedup for non-alias URLs)
  ├── Generate shortId via nanoid(8)
  ├── Save to MongoDB with metadata
  └── Return shortened URL object

User clicks short URL → GET /:shortId
  ├── Find URL by shortId (indexed lookup)
  ├── Check: isActive? expired? maxClicks reached?
  ├── Record click metadata (IP, User-Agent, Referrer, Timestamp)
  ├── Increment click counter
  └── 302 Redirect to originalUrl
```

### 3. Database Design
- **Single Collection**: `urls` — stores all URL documents
- **Embedded Sub-documents**: `clickDetails[]` — stores click metadata inside each URL doc
- **Indexes**: `shortId` (unique), `createdAt` (descending), `clicks` (descending)

### 4. URL Expiry & Limits
- Optional TTL-based expiry (hours from creation)
- Optional max click limit — URL stops redirecting after N clicks
- URLs can be toggled active/inactive

### 5. API Design

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/url/shorten` | Shorten a single URL |
| POST | `/api/url/shorten/bulk` | Bulk shorten up to 50 URLs |
| GET | `/api/url/all` | Paginated list with search |
| GET | `/api/url/stats` | Overall dashboard statistics |
| GET | `/api/url/:id/analytics` | Per-URL click analytics |
| GET | `/api/url/:id/qr` | Generate QR code (base64) |
| PUT | `/api/url/:id` | Update URL settings |
| DELETE | `/api/url/:id` | Delete a URL |
| GET | `/:shortId` | Redirect to original URL |

### 6. Scalability Considerations
- **Read-heavy**: Most operations are redirects (reads). MongoDB indexed queries are O(log n)
- **Embedded clicks**: Avoids JOINs. For high-traffic URLs, a separate `clicks` collection would be better
- **Stateless API**: Horizontal scaling possible behind a load balancer
- **No auth required**: Simplifies deployment; can be added via JWT middleware later

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| ID Generation | nanoid |
| QR Codes | qrcode (server-side) |
| URL Validation | valid-url |

## Project Structure

```
URL_shortner/
├── server/                 # Backend (Express + MongoDB)
│   ├── config/db.js        # MongoDB connection
│   ├── models/Url.js       # Mongoose schema
│   ├── routes/url.js       # API routes
│   ├── server.js           # Entry point
│   ├── .env.example        # Environment template
│   └── package.json
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/          # Home, Dashboard, Analytics
│   │   ├── App.jsx         # Router + Layout
│   │   ├── api.js          # API service layer
│   │   ├── index.css       # Global styles
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md               # System Design (this file)
├── README2.md              # Frontend Documentation
├── README3.md              # Backend Documentation
├── README4.md              # Database Schema
└── README5.md              # Full-Stack Connection Guide
```

---

## Connect with Me

| Platform | Link |
|----------|------|
| GitHub | [code0era](https://github.com/code0era) |
| LinkedIn | [Shubham Yadav](https://www.linkedin.com/in/shubham-yadav-38a467267/) |
| Email | ashubhamyadav61@gmail.com |
| LeetCode | [Code0Era](https://leetcode.com/u/Code0Era/) |
| Phone | +91-9569768198 |

**Shubham Yadav** • B.Tech CS, IIIT Kalyani (2026) • 8.28 CGPA
