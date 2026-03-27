import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllUrls, deleteUrl, getStats } from '../api'

function Dashboard() {
  const [urls, setUrls] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [urlData, statsData] = await Promise.all([getAllUrls(1, 50, search), getStats()])
      setUrls(urlData.urls || [])
      setStats(statsData)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [search])

  const handleDelete = async (shortId) => {
    await deleteUrl(shortId)
    fetchData()
  }

  const copy = (shortId) => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${shortId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="container">
      <h2 className="page-heading">Dashboard</h2>
      <p className="page-sub">Manage and track your shortened URLs</p>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{stats.totalUrls}</div><div className="stat-label">Total URLs</div></div>
          <div className="stat-card"><div className="stat-value">{stats.totalClicks}</div><div className="stat-label">Total Clicks</div></div>
          <div className="stat-card"><div className="stat-value">{stats.activeUrls}</div><div className="stat-label">Active URLs</div></div>
        </div>
      )}

      <div className="url-form">
        <input placeholder="Search URLs..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : urls.length === 0 ? (
        <div className="empty"><p>No URLs found. Create one from the home page!</p></div>
      ) : (
        urls.map((u) => (
          <div className="url-item" key={u._id}>
            <div className="url-info">
              <span className="url-short" onClick={() => copy(u.shortId)}>
                /{u.shortId}
              </span>
              <span className="url-original">{u.originalUrl}</span>
            </div>
            <div className="url-actions">
              <span className="url-clicks">🔥 {u.clicks} clicks</span>
              <button className="btn btn-sm btn-outline" onClick={() => copy(u.shortId)}>📋</button>
              <button className="btn btn-sm btn-outline" onClick={() => navigate(`/analytics/${u.shortId}`)}>📊</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.shortId)}>🗑</button>
            </div>
          </div>
        ))
      )}
      {copied && <div className="toast">✅ Copied to clipboard!</div>}
    </div>
  )
}

export default Dashboard
