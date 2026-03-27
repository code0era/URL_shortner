import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAnalytics } from '../api'

function Analytics() {
  const { shortId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAnalytics(shortId)
        setData(res)
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetch()
  }, [shortId])

  if (loading) return <div className="container loading">Loading analytics...</div>
  if (!data || data.error) return <div className="container empty"><p>URL not found</p></div>

  const { url, analytics } = data
  const maxRef = Math.max(...Object.values(analytics.referrerStats || {1:1}), 1)
  const maxBrowser = Math.max(...Object.values(analytics.browserStats || {1:1}), 1)

  return (
    <div className="container">
      <button className="btn btn-sm btn-outline" onClick={() => navigate('/dashboard')} style={{marginBottom:'1rem'}}>← Back</button>
      <h2 className="page-heading">Analytics: /{shortId}</h2>
      <p className="page-sub" style={{wordBreak:'break-all'}}>{url.originalUrl}</p>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{url.totalClicks}</div><div className="stat-label">Total Clicks</div></div>
        <div className="stat-card"><div className="stat-value">{url.isActive ? '🟢' : '🔴'}</div><div className="stat-label">{url.isActive ? 'Active' : 'Inactive'}</div></div>
        <div className="stat-card"><div className="stat-value">{new Date(url.createdAt).toLocaleDateString()}</div><div className="stat-label">Created</div></div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>🌐 Referrers</h4>
          {Object.keys(analytics.referrerStats).length === 0 ? <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>No data yet</p> :
            Object.entries(analytics.referrerStats).map(([ref, count]) => (
              <div className="analytics-bar" key={ref}>
                <span className="analytics-bar-label">{ref.replace(/https?:\/\//, '').slice(0,20)}</span>
                <div style={{flex:1}}><div className="analytics-bar-fill" style={{width:`${(count/maxRef)*100}%`}} /></div>
                <span className="analytics-bar-value">{count}</span>
              </div>
            ))
          }
        </div>
        <div className="analytics-card">
          <h4>🖥 Browsers</h4>
          {Object.keys(analytics.browserStats).length === 0 ? <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>No data yet</p> :
            Object.entries(analytics.browserStats).map(([browser, count]) => (
              <div className="analytics-bar" key={browser}>
                <span className="analytics-bar-label">{browser}</span>
                <div style={{flex:1}}><div className="analytics-bar-fill" style={{width:`${(count/maxBrowser)*100}%`}} /></div>
                <span className="analytics-bar-value">{count}</span>
              </div>
            ))
          }
        </div>
      </div>

      <div className="analytics-card" style={{marginTop:'1rem'}}>
        <h4>🕐 Recent Clicks</h4>
        {analytics.recentClicks.length === 0 ? <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>No clicks yet</p> :
          analytics.recentClicks.slice(0,10).map((c, i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid var(--border)',fontSize:'0.8rem'}}>
              <span style={{color:'var(--text-secondary)'}}>{new Date(c.timestamp).toLocaleString()}</span>
              <span style={{color:'var(--text-muted)'}}>{c.referrer?.slice(0,30) || 'Direct'}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Analytics
