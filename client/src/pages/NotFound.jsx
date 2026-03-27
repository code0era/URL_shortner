import { NavLink } from 'react-router-dom'

function NotFound() {
  return (
    <div className="container" style={{textAlign:'center',paddingTop:'4rem'}}>
      <h1 style={{fontSize:'5rem',fontWeight:800,background:'linear-gradient(135deg,var(--accent),#e040fb)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>404</h1>
      <p style={{fontSize:'1.2rem',color:'var(--text-secondary)',marginBottom:'2rem'}}>Page not found</p>
      <NavLink to="/" className="btn btn-primary">← Back to Home</NavLink>
    </div>
  )
}

export default NotFound
