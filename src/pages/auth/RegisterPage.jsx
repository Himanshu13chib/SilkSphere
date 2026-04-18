import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import SilkLogo from '../../components/ui/SilkLogo'

const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu & Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal']

function FarmerSVG() {
  return (
    <svg viewBox="0 0 140 120" width="140" height="110" fill="none">
      <ellipse cx="70" cy="105" rx="35" ry="10" fill="#e8f5e9" />
      <path d="M45 98 Q50 82 60 78 Q65 76 70 78 L80 76 Q85 75 86 80 Q87 85 82 86 L78 87 Q83 86 84 91 Q85 96 80 97 L76 98 Q80 98 80 103 Q80 108 75 108 L55 108 Q48 108 45 103 Z" fill="#ffcc80" />
      <line x1="70" y1="78" x2="70" y2="42" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M70 60 Q57 51 53 38 Q63 41 70 52" fill="#4caf50" />
      <path d="M70 56 Q83 47 87 34 Q77 37 70 48" fill="#66bb6a" />
      <circle cx="47" cy="65" r="2.5" fill="#4caf50" opacity="0.6" />
      <circle cx="93" cy="60" r="2.5" fill="#4caf50" opacity="0.6" />
      <line x1="47" y1="65" x2="57" y2="65" stroke="#4caf50" strokeWidth="1" opacity="0.5" />
      <line x1="83" y1="60" x2="93" y2="60" stroke="#4caf50" strokeWidth="1" opacity="0.5" />
      <ellipse cx="60" cy="106" rx="6" ry="4" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="1" />
      <ellipse cx="72" cy="104" rx="6" ry="4" fill="#fafafa" stroke="#e0e0e0" strokeWidth="1" />
    </svg>
  )
}

function BuyerSVG() {
  return (
    <svg viewBox="0 0 140 120" width="140" height="110" fill="none">
      <rect x="48" y="15" width="44" height="80" rx="7" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="1.5" />
      <rect x="52" y="23" width="36" height="58" rx="3" fill="white" />
      <rect x="57" y="28" width="26" height="26" rx="2" fill="#f9f9f9" stroke="#e0e0e0" strokeWidth="0.8" />
      <rect x="59" y="30" width="7" height="7" rx="1" fill="#1a1a1a" />
      <rect x="75" y="30" width="7" height="7" rx="1" fill="#1a1a1a" />
      <rect x="59" y="46" width="7" height="7" rx="1" fill="#1a1a1a" />
      <rect x="68" y="32" width="3" height="3" fill="#1a1a1a" />
      <rect x="68" y="37" width="3" height="3" fill="#1a1a1a" />
      <rect x="73" y="37" width="3" height="3" fill="#1a1a1a" />
      <rect x="68" y="42" width="3" height="3" fill="#1a1a1a" />
      <rect x="73" y="46" width="3" height="3" fill="#1a1a1a" />
      <circle cx="70" cy="68" r="7" fill="#e8f5e9" />
      <text x="70" y="72" textAnchor="middle" fontSize="9" fill="#2e7d32">★</text>
      <circle cx="70" cy="88" r="3.5" fill="#e0e0e0" />
      <path d="M43 84 Q41 75 45 69 Q48 64 52 64 L52 98 Q47 100 44 96 Z" fill="#ffcc80" />
      <line x1="28" y1="52" x2="48" y2="52" stroke="#4caf50" strokeWidth="1" opacity="0.5" />
      <line x1="92" y1="48" x2="112" y2="48" stroke="#4caf50" strokeWidth="1" opacity="0.5" />
      <circle cx="25" cy="52" r="2.5" fill="#4caf50" opacity="0.5" />
      <circle cx="115" cy="48" r="2.5" fill="#4caf50" opacity="0.5" />
    </svg>
  )
}

export default function RegisterPage({ onLogin }) {
  const { register, addToast } = useApp()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', state: '', email: '', password: '', confirm: '', companyName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!role) return setError('Please select a role')
    const nameVal = role === 'buyer' ? form.companyName.trim() : form.name.trim()
    if (!form.email.trim() || !form.password || !nameVal || !form.phone.trim()) return setError('All fields are required')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const extra = role === 'farmer'
      ? { state: form.state, farmName: form.name, phone: form.phone }
      : { companyName: form.companyName, phone: form.phone }
    const err = register(nameVal, form.email, form.password, role, extra)
    setLoading(false)
    if (err) { setError(err); return }
    addToast('Account created! Welcome to SilkSphere.', 'success')
  }

  if (step === 0) return (
    <div className="auth-bg">
      <div className="auth-logo" style={{ marginBottom: 24 }}>
        <SilkLogo size={52} />
        <div className="auth-logo-name">SilkSphere Platform</div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: 680, padding: '32px', animation: 'fadeSlideUp 0.4s ease both', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Create Your SilkSphere Account</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Farmer card */}
          <div className={`role-card ${role === 'farmer' ? 'selected' : ''}`} onClick={() => setRole('farmer')}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Farmer Sign-Up</div>
            <FarmerSVG />
            <div style={{ fontSize: 12, color: '#555', textAlign: 'center', lineHeight: 1.6 }}>
              Access real-time IoT monitoring, hybrid AI diagnostics, and list your graded batches for sale.
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Requires email verification</div>
            <button
              className="auth-submit"
              style={{ width: '100%', marginTop: 4 }}
              onClick={(e) => { e.stopPropagation(); setRole('farmer'); setStep(1) }}
            >
              Create Farmer Account
            </button>
          </div>

          {/* Buyer card */}
          <div className={`role-card ${role === 'buyer' ? 'selected' : ''}`} onClick={() => setRole('buyer')}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Industry Buyer Sign-Up</div>
            <BuyerSVG />
            <div style={{ fontSize: 12, color: '#555', textAlign: 'center', lineHeight: 1.6 }}>
              Browse verified, graded batches with full environmental history and secure data. Place orders efficiently.
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Requires email verification</div>
            <button
              className="auth-submit"
              style={{ width: '100%', marginTop: 4 }}
              onClick={(e) => { e.stopPropagation(); setRole('buyer'); setStep(1) }}
            >
              Create Buyer Account
            </button>
          </div>
        </div>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          Already have an account?{' '}
          <button className="auth-link" onClick={onLogin}>Sign In</button>
        </div>
      </div>

      <div className="auth-page-footer">
        <div>© 2024 SilkSphere Technologies</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="#">Legal Inks</a><span>|</span>
          <a href="#">Terms Policy</a><span>|</span>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="auth-bg">
      <div className="auth-logo" style={{ marginBottom: 24 }}>
        <SilkLogo size={52} />
        <div className="auth-logo-name">SilkSphere Platform</div>
      </div>

      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2e7d32,#4caf50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            {role === 'farmer' ? '🌿' : '🏭'}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{role === 'farmer' ? 'Farmer Account' : 'Buyer Account'}</div>
            <div style={{ fontSize: 11, color: '#888' }}>Fill in your details</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {role === 'farmer' ? (
            <>
              <div className="form-group"><label className="form-label">Farm / Full Name</label><input className="form-input" placeholder="e.g. Green Silk Farm" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="10-digit mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">State</label>
                <select className="form-select" value={form.state} onChange={e => set('state', e.target.value)} required>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" placeholder="e.g. Silk Industries Ltd" value={form.companyName} onChange={e => set('companyName', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="10-digit mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
            </>
          )}
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required /></div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button type="submit" className="auth-submit" style={{ flex: 1 }} disabled={loading}>
              {loading && <span className="auth-spinner" />}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
        <div className="auth-footer">Already have an account? <button className="auth-link" onClick={onLogin}>Sign In</button></div>
      </div>

      <div className="auth-page-footer">
        <div>© 2024 SilkSphere Technologies</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="#">Legal Inks</a><span>|</span><a href="#">Terms Policy</a><span>|</span><a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}
