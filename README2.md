# 🎨 SnipURL — Frontend Documentation

> React 18 + Vite frontend for the URL Shortener application.

## Tech Stack

- **React 18** — UI library with hooks
- **Vite** — Fast build tool with HMR
- **React Router v6** — Client-side routing
- **Vanilla CSS** — Dark theme with CSS custom properties

## Pages

### 1. Home Page (`/`)
The landing page with the URL shortening form.

**Features:**
- URL input with validation
- Advanced options toggle (custom alias, expiry time)
- Shortened URL result card with copy button
- QR code generation modal
- Feature highlight cards (Instant Shortening, Analytics, Custom Aliases, QR Codes)

**State Management:**
```
url, alias, expiry — form inputs
result — shortened URL response from API
error — error message display
loading — submit button loading state
copied — toast notification trigger
qrCode — QR code modal data
showOptions — advanced options visibility toggle
```

### 2. Dashboard Page (`/dashboard`)
Manage all shortened URLs with stats overview.

**Features:**
- Stats grid showing total URLs, total clicks, active URLs
- Search filter for URLs
- URL list with short ID, original URL, click count
- Actions per URL: Copy, View Analytics, Delete

**Data Fetching:**
- `getAllUrls()` — paginated URL list with search
- `getStats()` — aggregate statistics
- Both called on mount and on search change

### 3. Analytics Page (`/analytics/:shortId`)
Detailed click analytics for a specific URL.

**Features:**
- Stats grid: total clicks, active status, creation date
- Referrer breakdown with bar charts
- Browser usage breakdown with bar charts
- Recent clicks list with timestamp and referrer

## Component Architecture

```
App.jsx
├── Navbar (with NavLink active states)
├── Routes
│   ├── Home.jsx        — URL shortening form
│   ├── Dashboard.jsx   — URL management
│   └── Analytics.jsx   — Per-URL analytics
└── Footer (contact links)
```

## API Service Layer (`api.js`)

All backend communication goes through `api.js`:

| Function | Method | Endpoint |
|----------|--------|----------|
| `shortenUrl(data)` | POST | `/api/url/shorten` |
| `bulkShorten(urls)` | POST | `/api/url/shorten/bulk` |
| `getAllUrls(page, limit, search)` | GET | `/api/url/all` |
| `getStats()` | GET | `/api/url/stats` |
| `getAnalytics(shortId)` | GET | `/api/url/:id/analytics` |
| `getQRCode(shortId)` | GET | `/api/url/:id/qr` |
| `updateUrl(shortId, data)` | PUT | `/api/url/:id` |
| `deleteUrl(shortId)` | DELETE | `/api/url/:id` |

## Styling

- **Dark theme** with CSS custom properties (`--bg-primary`, `--accent`, etc.)
- **Glassmorphism** effect on navbar with `backdrop-filter: blur(10px)`
- **Gradient accents** using `linear-gradient(135deg, #6c63ff, #e040fb)`
- **Responsive design** — mobile-friendly with CSS media queries
- **Micro-animations** — hover transforms, toast slide-in, fade-out

## Running the Frontend

```bash
cd client
npm install
npm run dev     # starts at http://localhost:5173
```

Vite proxies `/api` requests to `http://localhost:5000` (backend).

---

**Built by [Shubham Yadav](https://github.com/code0era)** • IIIT Kalyani
