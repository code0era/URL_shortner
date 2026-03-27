# 🔧 SnipURL — Backend Documentation

> Node.js + Express + MongoDB backend for the URL Shortener.

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — Web framework
- **MongoDB** — NoSQL database
- **Mongoose** — MongoDB ODM
- **nanoid** — Short ID generation
- **qrcode** — Server-side QR code generation
- **valid-url** — URL validation
- **cors** — Cross-Origin Resource Sharing
- **dotenv** — Environment variables

## File Structure

```
server/
├── config/
│   └── db.js           # MongoDB connection using Mongoose
├── models/
│   └── Url.js          # URL schema with click tracking
├── routes/
│   └── url.js          # All API endpoints
├── server.js           # Express app entry point
├── .env.example        # Environment variable template
└── package.json        # Dependencies and scripts
```

## Server Setup (`server.js`)

1. Loads `.env` configuration
2. Connects to MongoDB via `connectDB()`
3. Configures middleware: CORS, JSON parser, request logger
4. Mounts API routes at `/api/url`
5. Handles `GET /:shortId` for URL redirection
6. Starts Express server on PORT (default: 5000)

## API Endpoints

### Shorten URL
```
POST /api/url/shorten
Body: { originalUrl, customAlias?, expiresIn?, password?, maxClicks?, tags? }
Response: URL document object
```

### Bulk Shorten
```
POST /api/url/shorten/bulk
Body: { urls: string[] }    // max 50 URLs
Response: Array of URL objects or errors
```

### Get All URLs
```
GET /api/url/all?page=1&limit=20&search=&sortBy=createdAt&order=desc
Response: { urls: [], pagination: { total, page, pages, limit } }
```

### Get Statistics
```
GET /api/url/stats
Response: { totalUrls, totalClicks, activeUrls, topUrls[], recentUrls[], clicksPerDay[] }
```

### Get Analytics
```
GET /api/url/:shortId/analytics
Response: { url: {...}, analytics: { referrerStats, browserStats, clicksByHour, clicksByDay, recentClicks } }
```

### Generate QR Code
```
GET /api/url/:shortId/qr
Response: { qrCode: "data:image/png;base64,...", shortUrl: "..." }
```

### Update URL
```
PUT /api/url/:shortId
Body: { isActive?, tags?, maxClicks?, expiresIn? }
Response: Updated URL object
```

### Delete URL
```
DELETE /api/url/:shortId
Response: { message: "URL deleted", url: {...} }
```

### Redirect
```
GET /:shortId → 302 Redirect to originalUrl
```

Redirect flow:
1. Find URL by `shortId`
2. Check `isActive`, `expiresAt`, `maxClicks`
3. Record click details (IP, User-Agent, Referrer)
4. Increment click counter
5. Redirect with `302`

## Middleware

- **CORS**: Allows requests from `CLIENT_URL` (default: `http://localhost:5173`)
- **JSON Parser**: `express.json()` for request body parsing
- **Request Logger**: Logs `[timestamp] METHOD /path` for every request

## Running the Backend

```bash
cd server
cp .env.example .env     # configure your MongoDB URI
npm install
npm run dev              # starts with nodemon on port 5000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| MONGO_URI | mongodb://localhost:27017/urlshortener | MongoDB connection string |
| CLIENT_URL | http://localhost:5173 | Frontend URL for CORS |
| BASE_URL | http://localhost:5000 | Base URL for QR codes |

---

**Built by [Shubham Yadav](https://github.com/code0era)** • IIIT Kalyani
