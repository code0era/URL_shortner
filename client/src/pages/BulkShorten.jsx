import { useState } from 'react'
import { bulkShorten } from '../api'

function BulkShorten() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const urls = input.split('\n').map(u => u.trim()).filter(Boolean)
    if (urls.length === 0) return
    setLoading(true)
    try {
      const data = await bulkShorten(urls)
      setResults(data)
    } catch { setResults([]) }
    setLoading(false)
  }

  const copyAll = () => {
    const text = results
      .filter(r => r.shortId)
      .map(r => `${window.location.origin}/${r.shortId}`)
      .join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="container">
      <h2 className="page-heading">Bulk Shorten</h2>
      <p className="page-sub">Shorten up to 50 URLs at once. One URL per line.</p>

      <form onSubmit={handleSubmit}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={"https://example1.com\nhttps://example2.com\nhttps://example3.com"}
          rows={6}
          style={{
            width:'100%', padding:'1rem', background:'var(--bg-input)',
            border:'1px solid var(--border)', borderRadius:'var(--radius)',
            color:'var(--text-primary)', fontFamily:'inherit', fontSize:'0.9rem',
            resize:'vertical', outline:'none', marginBottom:'1rem'
          }}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Shortening...' : `Shorten ${input.split('\n').filter(u=>u.trim()).length} URLs`}
        </button>
      </form>

      {results.length > 0 && (
        <div style={{marginTop:'1.5rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h3 style={{fontSize:'1.1rem'}}>Results ({results.filter(r=>r.shortId).length} shortened)</h3>
            <button className="btn btn-sm btn-success" onClick={copyAll}>📋 Copy All</button>
          </div>
          {results.map((r, i) => (
            <div className="url-item" key={i}>
              <div className="url-info">
                {r.shortId ? (
                  <>
                    <span className="url-short">{window.location.origin}/{r.shortId}</span>
                    <span className="url-original">{r.originalUrl}</span>
                  </>
                ) : (
                  <span style={{color:'var(--danger)',fontSize:'0.85rem'}}>❌ {r.originalUrl} — {r.error}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {copied && <div className="toast">✅ Copied all URLs!</div>}
    </div>
  )
}

export default BulkShorten
