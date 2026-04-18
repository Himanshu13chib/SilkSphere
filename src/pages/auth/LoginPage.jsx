import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import SilkLogo from '../../components/ui/SilkLogo'
import '../../styles/auth.css'

function FarmerIllustration() {
  return (
    <svg viewBox="0 0 160 140" width="160" height="140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand holding plant */}
      <ellipse cx="80" cy="120" rx="40" ry="12" fill="#e8f5e9" />
      {/* Hand */}
      <path d="M55 110 Q60 95 70 90 Q75 88 80 90 L90 88 Q95 87 96 92 Q97 97 92 98 L88 99 Q93 98 94 103 Q95 108 90 109 L86 110 Q90 110 90 115 Q90 120 85 120 L65 120 Q58 120 55 115 Z" fill="#ffcc80" />
      {/* Stem */}
      <line x1="80" y1="90" x2="80" y2="50" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M80 70 Q65 60 60 45 Q72 48 80 60" fill="#4caf50" />
      <path d="M80 65 Q95 55 100 40 Q88 43 80 55" fill="#66bb6a" />
      {/* Circuit dots */}
      <circle cx="55" cy="75" r="3" fill="#4caf50" opacity="0.6" />
      <circle cx="105" cy="70" r="3" fill="#4caf50" opacity="0.6" />
      <circle cx="50" cy="55" r="2" fill="#81c784" opacity="0.5" />
      <circle cx="110" cy="55" r="2" fill="#81c784" opacity="0.5" />
      {/* Circuit lines */}
      <line x1="55" y1="75" x2="65" y2="75" stroke="#4caf50" strokeWidth="1" opacity="0.5" />
      <line x1="95" y1="70" x2="105" y2="70" stroke="#4caf50" strokeWidth="1" opacity="0.5" />
      <line x1="55" y1="75" x2="50" y2="65" stroke="#4caf50" strokeWidth="1" opacity="0.4" />
      <line x1="105" y1="70" x2="110" y2="60" stroke="#4caf50" strokeWidth="1" opacity="0.4" />
      {/* Silkworm cocoons at base */}
      <ellipse cx="68" cy="118" rx="7" ry="5" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="1" />
      <ellipse cx="82" cy="116" rx="7" ry="5" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="1" />
      <ellipse cx="75" cy="122" rx="6" ry="4" fill="#fafafa" stroke="#e0e0e0" strokeWidth="1" />
    </svg>
  )
}

function BuyerIllustration() {
  return (
    <svg viewBox="0 0 160 140" width="160" height="140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Phone body */}
      <rect x="55" y="20" width="50" height="90" rx="8" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="2" />
      <rect x="59" y="28" width="42" height="66" rx="4" fill="white" />
      {/* QR code on screen */}
      <rect x="65" y="34" width="30" height="30" rx="2" fill="#f9f9f9" stroke="#e0e0e0" strokeWidth="1" />
      {/* QR pattern */}
      <rect x="67" y="36" width="8" height="8" rx="1" fill="#1a1a1a" />
      <rect x="85" y="36" width="8" height="8" rx="1" fill="#1a1a1a" />
      <rect x="67" y="54" width="8" height="8" rx="1" fill="#1a1a1a" />
      <rect x="77" y="38" width="4" height="4" fill="#1a1a1a" />
      <rect x="77" y="44" width="4" height="4" fill="#1a1a1a" />
      <rect x="83" y="44" width="4" height="4" fill="#1a1a1a" />
      <rect x="77" y="50" width="4" height="4" fill="#1a1a1a" />
      <rect x="83" y="54" width="4" height="4" fill="#1a1a1a" />
      <rect x="87" y="50" width="4" height="4" fill="#1a1a1a" />
      {/* Star/badge icon */}
      <circle cx="80" cy="78" r="8" fill="#e8f5e9" />
      <text x="80" y="82" textAnchor="middle" fontSize="10" fill="#2e7d32">★</text>
      {/* Home button */}
      <circle cx="80" cy="102" r="4" fill="#e0e0e0" />
      {/* Hand holding phone */}
      <path d="M50 95 Q48 85 52 78 Q55 72 60 72 L60 110 Q55 112 52 108 Z" fill="#ffcc80" />
      {/* Circuit lines */}
      <line x1="35" y1="60" x2="55" y2="60" stroke="#4caf50" strokeWidth="1" opacity="0.5" />
      <line x1="105" y1="55" x2="125" y2="55" stroke="#4caf50" strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="60" r="3" fill="#4caf50" opacity="0.5" />
      <circle cx="128" cy="55" r="3" fill="#4caf50" opacity="0.5" />
      <line x1="32" y1="60" x2="28" y2="50" stroke="#4caf50" strokeWidth="1" opacity="0.4" />
      <line x1="128" y1="55" x2="132" y2="45" stroke="#4caf50" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}


export default function LoginPage({ onRegister }) {
  const { login, addToast } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    const err = login(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    addToast('Welcome back to SilkSphere!', 'success')
  }

  return (
    <div className="auth-bg">
      {/* Header logo */}
      <div className="auth-logo" style={{ marginBottom: 24 }}>
        <SilkLogo size={52} />
        <div>
          <div className="auth-logo-name">SilkSphere Platform</div>
        </div>
      </div>

      {/* Main card — split layout */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: 580, display: 'flex', overflow: 'hidden', animation: 'fadeSlideUp 0.4s ease both', position: 'relative', zIndex: 1 }}>
        {/* Left: Logo panel */}
        <div style={{ flex: 1, padding: '32px 24px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#000' }}>
          <img src="/images/silksphere-logo.png" alt="SilkSphere Logo" style={{ width: '100%', maxWidth: 200, objectFit: 'contain' }} />
          <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 1.6 }}>
            Weaving the Future<br />of Sericulture
          </div>
        </div>

        {/* Right: Form */}
        <div style={{ flex: 1.2, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Farmer &amp; Admin Login</div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 14 }}>✉</span>
                <input className="form-input" style={{ paddingLeft: 32 }} type="email" placeholder="you@farm.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 14 }}>🔒</span>
                <input className="form-input" style={{ paddingLeft: 32 }} type="password" placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div style={{ textAlign: 'right', marginTop: 2 }}>
                <span style={{ fontSize: 11, color: '#2e7d32', cursor: 'pointer', fontWeight: 500 }}>Forgot Password?</span>
              </div>
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading && <span className="auth-spinner" />}
              {loading ? 'Signing in...' : 'Sign In with Email'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
            <span style={{ fontSize: 12, color: '#aaa' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
          </div>

          <button className="btn btn-ghost" style={{ width: '100%', fontWeight: 700 }} onClick={onRegister}>Sign Up</button>


        </div>
      </div>

      <div className="auth-page-footer">
        <div>© 2024 SilkSphere Technologies</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="#">Legal Inks</a>
          <span>|</span>
          <a href="#">Terms Policy</a>
          <span>|</span>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}
