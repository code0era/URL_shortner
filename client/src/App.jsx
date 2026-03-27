import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import BulkShorten from './pages/BulkShorten'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <NavLink to="/" className="navbar-brand">⚡ SnipURL</NavLink>
          <div className="navbar-links">
            <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
            <NavLink to="/bulk" className={({isActive}) => isActive ? 'active' : ''}>Bulk</NavLink>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bulk" element={<BulkShorten />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics/:shortId" element={<Analytics />} />
        </Routes>

        <footer className="footer">
          <div className="footer-links">
            <a href="https://github.com/code0era" target="_blank" rel="noreferrer">🐙 GitHub</a>
            <a href="https://www.linkedin.com/in/shubham-yadav-38a467267/" target="_blank" rel="noreferrer">💼 LinkedIn</a>
            <a href="mailto:ashubhamyadav61@gmail.com">📧 Email</a>
            <a href="https://leetcode.com/u/Code0Era/" target="_blank" rel="noreferrer">🧩 LeetCode</a>
          </div>
          <p>Built by <strong>Shubham Yadav</strong> • B.Tech CS, IIIT Kalyani • +91-9569768198</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
