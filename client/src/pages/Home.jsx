import { useState } from 'react'
import { shortenUrl } from '../api'

function Home() {
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [expiry, setExpiry] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [qrCode, setQrCode] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await shortenUrl({
        originalUrl: url,
        customAlias: alias || undefined,
        expiresIn: expiry || undefined
      })
      if (data.error) { setError(data.error) }
      else { setResult(data); setUrl(''); setAlias(''); setExpiry('') }
    } catch { setError('Failed to shorten URL') }
    setLoading(false)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const fetchQR = async (shortId) => {
    try {
      const res = await fetch(`/api/url/${shortId}/qr`)
      const data = await res.json()
      setQrCode(data)
    } catch { /* ignore */ }
  }

  const shortUrl = result ? `${window.location.origin}/${result.shortId}` : ''

  return (
    <div>
      <div className="hero">
        <h1>Shorten Your <span>Links</span></h1>
        <p>Fast, free, and trackable. Create short URLs with analytics, QR codes, and custom aliases.</p>
      </div>

      <div className="container">
        <form className="url-form" onSubmit={handleSubmit}>
          <input
            type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your long URL here..." required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? '...' : 'Shorten'}
          </button>
        </form>

        <div style={{textAlign:'center',marginBottom:'1rem'}}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowOptions(!showOptions)}>
            {showOptions ? '▲ Hide Options' : '▼ Advanced Options'}
          </button>
        </div>

        {showOptions && (
          <div className="options-row">
            <input placeholder="Custom alias (optional)" value={alias}
              onChange={(e) => setAlias(e.target.value)} />
            <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
              <option value="">No expiry</option>
              <option value="1">1 hour</option>
              <option value="24">24 hours</option>
              <option value="168">7 days</option>
              <option value="720">30 days</option>
            </select>
          </div>
        )}

        {error && <div className="card" style={{borderColor:'var(--danger)',color:'var(--danger)'}}>{error}</div>}

        {result && (
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.5rem'}}>
              <div>
                <span className="url-short" onClick={() => copyToClipboard(shortUrl)}>{shortUrl}</span>
                <span className="url-original">{result.originalUrl}</span>
              </div>
              <div style={{display:'flex',gap:'0.5rem'}}>
                <button className="btn btn-sm btn-success" onClick={() => copyToClipboard(shortUrl)}>📋 Copy</button>
                <button className="btn btn-sm btn-outline" onClick={() => fetchQR(result.shortId)}>QR Code</button>
              </div>
            </div>
          </div>
        )}

        {qrCode && (
          <div className="modal-overlay" onClick={() => setQrCode(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>QR Code</h3>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{qrCode.shortUrl}</p>
              <img src={qrCode.qrCode} alt="QR Code" width="250" />
              <br />
              <button className="btn btn-sm btn-outline" onClick={() => setQrCode(null)}>Close</button>
            </div>
          </div>
        )}

        {copied && <div className="toast">✅ Copied to clipboard!</div>}

        <div className="stats-grid" style={{marginTop:'3rem'}}>
          <div className="stat-card"><div className="stat-value">⚡</div><div className="stat-label">Instant Shortening</div></div>
          <div className="stat-card"><div className="stat-value">📊</div><div className="stat-label">Click Analytics</div></div>
          <div className="stat-card"><div className="stat-value">🔗</div><div className="stat-label">Custom Aliases</div></div>
          <div className="stat-card"><div className="stat-value">📱</div><div className="stat-label">QR Code Generation</div></div>
        </div>
      </div>
    </div>
  )
}

export default Home
