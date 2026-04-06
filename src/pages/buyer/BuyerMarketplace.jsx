import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Search, X, ShoppingCart, Shield } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'

const BLOCKCHAIN_HASH = '0x4f3a8b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2'

const ENV_CHART = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  actual: +(78 + Math.sin(i / 3) * 6 + Math.random() * 3).toFixed(1),
  ideal: 85,
}))

function SilkPassportModal({ batch, onClose, onOrder }) {
  const diary = [
    { date: 'Mar 1', event: 'Batch initiated — eggs placed in incubation', type: 'info' },
    { date: 'Mar 5', event: 'Hatching complete — 98% success rate', type: 'success' },
    { date: 'Mar 10', event: 'Instar 1 commenced — first feeding', type: 'info' },
    { date: 'Mar 13', event: 'First molt completed', type: 'success' },
    { date: 'Mar 15', event: 'AI Scan: Healthy (100% confidence)', type: 'success' },
    { date: 'Mar 17', event: 'Instar 3 commenced — rapid growth phase', type: 'info' },
    { date: 'Mar 19', event: 'CO₂ spike corrected — ventilation adjusted', type: 'warning' },
    { date: 'Mar 19', event: 'Grade A certification issued', type: 'success' },
  ]

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={18} color="var(--gold)" />
            <div className="modal-title">Silk Passport</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* QR + ID */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, background: 'var(--bg3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2, padding: 8 }}>
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i} style={{ width: 8, height: 8, background: Math.random() > 0.5 ? 'var(--text)' : 'transparent', borderRadius: 1 }} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 800 }}>{batch.id}</div>
              <div style={{ marginTop: 4 }}><span className={`badge badge-${batch.grade}`}>Grade {batch.grade}</span></div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{batch.farmer} · {batch.instarStage}</div>
            </div>
          </div>

          {/* Scores */}
          <div className="grid-2" style={{ gap: 10 }}>
            {[['Environmental Score', batch.envScore, 'green'], ['AI Health Score', batch.aiScore, 'gold']].map(([label, val, color]) => (
              <div key={label} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: `var(--${color})`, marginBottom: 6 }}>{val}%</div>
                <div className="progress-bar"><div className={`progress-fill ${color}`} style={{ width: `${val}%` }} /></div>
              </div>
            ))}
          </div>

          {/* Blockchain */}
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              Blockchain Verified — Tamper-proof
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text2)', wordBreak: 'break-all' }}>{BLOCKCHAIN_HASH}</div>
          </div>

          {/* Env Chart */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Environmental Stability</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={ENV_CHART} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 9 }} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: 'var(--text3)', fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 6, fontSize: 11 }} />
                <ReferenceLine y={85} stroke="var(--green)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="actual" stroke="var(--accent)" strokeWidth={2} dot={false} name="Actual" />
                <Line type="monotone" dataKey="ideal" stroke="var(--green)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Ideal" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Diary */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Daily Diary</div>
            <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {diary.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < diary.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.type === 'success' ? 'var(--green)' : d.type === 'warning' ? 'var(--orange)' : 'var(--blue)', flexShrink: 0, marginTop: 4 }} />
                  <div style={{ fontSize: 11, color: 'var(--text3)', minWidth: 40 }}>{d.date}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{d.event}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(34,197,94,0.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
            <span style={{ color: 'var(--green)' }}>✓</span>
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Verified by SilkSphere Blockchain Registry</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-gold" onClick={() => { onOrder(batch); onClose() }}>Place Purchase Order</button>
        </div>
      </div>
    </div>
  )
}

export default function BuyerMarketplace() {
  const { batches, cart, addToCart, removeFromCart, placeOrder, addToast } = useApp()
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [sort, setSort] = useState('grade')
  const [passport, setPassport] = useState(null)

  const listed = batches.filter(b => b.status === 'listed')

  const filtered = listed
    .filter(b => gradeFilter === 'all' || b.grade === gradeFilter)
    .filter(b => !search || b.id.toLowerCase().includes(search.toLowerCase()) || b.farmer?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'env' ? b.envScore - a.envScore : (a.grade || 'Z').localeCompare(b.grade || 'Z'))

  const confirmProcurement = () => {
    placeOrder(cart.map(b => b.id))
    addToast(`${cart.length} batch(es) ordered successfully`, 'success')
  }

  const avgA = Math.round(listed.filter(b => b.grade === 'A').reduce((s, b) => s + b.price, 0) / (listed.filter(b => b.grade === 'A').length || 1))
  const avgB = Math.round(listed.filter(b => b.grade === 'B').reduce((s, b) => s + b.price, 0) / (listed.filter(b => b.grade === 'B').length || 1))

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Verified Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
          <Shield size={16} color="var(--green)" />
          <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>All batches verified by IoT sensors and AI diagnostics — blockchain-backed traceability</span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search batch ID or farmer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tabs">
            {['all', 'A', 'B', 'C'].map(g => (
              <button key={g} className={`tab ${gradeFilter === g ? 'active' : ''}`} onClick={() => setGradeFilter(g)}>
                {g === 'all' ? 'All' : `Grade ${g}`}
              </button>
            ))}
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="grade">Sort: Grade</option>
            <option value="price">Sort: Price</option>
            <option value="env">Sort: Env Score</option>
          </select>
        </div>

        {/* Batch Cards */}
        <div className="grid-auto">
          {filtered.map(b => (
            <div key={b.id} className="card" style={{ border: b.grade === 'A' ? '1px solid rgba(245,200,66,0.35)' : '1px solid var(--border)', boxShadow: b.grade === 'A' ? '0 0 24px rgba(245,200,66,0.12)' : 'none', animation: 'fadeSlideUp 0.4s ease both' }}>
              {b.grade === 'A' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--gold), var(--orange))', borderRadius: '12px 12px 0 0' }} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, background: 'var(--bg3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', fontSize: 10, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.2 }}>QR<br/>Code</div>
                <span className={`badge badge-${b.grade}`}>Grade {b.grade}</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{b.id}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{b.farmer} · {b.instarStage}</div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}><span>Env Score</span><span>{b.envScore}%</span></div>
                <div className="progress-bar"><div className="progress-fill green" style={{ width: `${b.envScore}%` }} /></div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}><span>AI Health</span><span>{b.aiScore}%</span></div>
                <div className="progress-bar"><div className="progress-fill gold" style={{ width: `${b.aiScore}%` }} /></div>
              </div>
              <div style={{ height: 36, marginBottom: 8 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={b.vitality.map((v, i) => ({ i, v }))}>
                    <Line type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', marginBottom: 12 }}>7-day vitality</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>₹{b.price?.toLocaleString('en-IN')}/kg</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{b.quantity} kg</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setPassport(b)}>🛡️ Silk Passport</button>
                <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={() => { addToCart(b); addToast(`${b.id} added to cart`, 'success') }}>
                  {cart.find(c => c.id === b.id) ? '✓ In Cart' : 'Place Order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panels */}
      <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80, flexShrink: 0 }}>
        {/* Cart */}
        {cart.length > 0 && (
          <div className="card" style={{ border: '1px solid rgba(245,200,66,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ShoppingCart size={16} color="var(--gold)" />
              <div style={{ fontWeight: 700, fontSize: 14 }}>Procurement Cart</div>
            </div>
            {cart.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}>{b.id}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>Grade {b.grade} · ₹{b.price?.toLocaleString('en-IN')}/kg</div>
                </div>
                <button onClick={() => removeFromCart(b.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
              </div>
            ))}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
              <span>Est. Total</span>
              <span style={{ color: 'var(--gold)' }}>₹{cart.reduce((s, b) => s + (b.price || 0) * (b.quantity || 10), 0).toLocaleString('en-IN')}</span>
            </div>
            <button className="btn btn-gold" style={{ width: '100%', marginTop: 10 }} onClick={confirmProcurement}>Confirm Procurement</button>
          </div>
        )}

        {/* Market Overview */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Market Overview</div>
          {[['Avg Grade A Price', `₹${avgA.toLocaleString('en-IN')}/kg`, 'var(--gold)'], ['Avg Grade B Price', `₹${avgB.toLocaleString('en-IN')}/kg`, 'var(--blue)'], ['Active Listings', listed.length, 'var(--green)'], ['Verified Farmers', '1', 'var(--accent)']].map(([label, val, color]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
              <span style={{ color: 'var(--text3)' }}>{label}</span>
              <span style={{ fontWeight: 700, color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {passport && <SilkPassportModal batch={passport} onClose={() => setPassport(null)} onOrder={(b) => { addToCart(b); addToast(`${b.id} added to cart`, 'success') }} />}
    </div>
  )
}
