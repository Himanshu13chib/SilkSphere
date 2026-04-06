import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Plus, ArrowDownLeft, CheckCircle, CreditCard, Smartphone, Building2, Wallet as WalletIcon } from 'lucide-react'

const METHODS = [
  { id: 'gpay', label: 'Google Pay', icon: '🟢', desc: 'Instant transfer' },
  { id: 'upi', label: 'UPI', icon: '🔵', desc: 'Any UPI app' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦', desc: 'NEFT / IMPS' },
  { id: 'card', label: 'Debit Card', icon: '💳', desc: 'Visa / Mastercard' },
]

const LINKED = [
  { label: 'Google Pay', id: 'farmer@okaxis', status: 'Active', icon: '🟢' },
  { label: 'PhonePe UPI', id: 'farmer@ybl', status: 'Active', icon: '🟣' },
  { label: 'Bank Account', id: 'XXXX XXXX 4521', status: 'Active', icon: '🏦' },
  { label: 'Debit Card', id: 'XXXX XXXX XXXX 8834', status: 'Link', icon: '💳' },
]

const METHOD_ICONS = { 'Google Pay': '🟢', 'UPI': '🔵', 'Bank Transfer': '🏦', 'Debit Card': '💳', 'PhonePe UPI': '🟣' }

function AddMoneyFlow({ onClose }) {
  const { addMoney, addToast } = useApp()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('')
  const presets = [500, 1000, 2000, 5000, 10000]

  const confirm = () => {
    addMoney(amount, method)
    addToast(`₹${Number(amount).toLocaleString('en-IN')} added via ${method}`, 'success')
    setStep(3)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Add Money — Step {step}/3</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Enter Amount (₹)</label>
                <input className="form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" style={{ fontSize: 24, fontWeight: 800, textAlign: 'center' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {presets.map(p => (
                  <button key={p} className={`btn btn-ghost btn-sm`} style={{ flex: 1, minWidth: 70, background: amount == p ? 'var(--bg4)' : '' }} onClick={() => setAmount(String(p))}>₹{p.toLocaleString('en-IN')}</button>
                ))}
              </div>
              <button className="btn btn-primary btn-lg" disabled={!amount || +amount <= 0} onClick={() => setStep(2)}>Next →</button>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Adding ₹{Number(amount).toLocaleString('en-IN')} via:</div>
              {METHODS.map(m => (
                <div key={m.id} onClick={() => setMethod(m.label)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 10, background: method === m.label ? 'rgba(99,102,241,0.1)' : 'var(--bg3)', border: `1px solid ${method === m.label ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 24 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{m.desc}</div>
                  </div>
                  {method === m.label && <span style={{ color: 'var(--accent)' }}>✓</span>}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={!method} onClick={confirm}>Confirm Payment</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scaleIn 0.4s ease' }}>
                <CheckCircle size={32} color="var(--green)" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>₹{Number(amount).toLocaleString('en-IN')} Added!</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>via {method}</div>
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WithdrawFlow({ onClose }) {
  const { wallet, withdrawMoney, addToast } = useApp()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('')
  const [account, setAccount] = useState('')
  const [err, setErr] = useState('')

  const next = () => {
    setErr('')
    if (+amount < 100) return setErr('Minimum withdrawal is ₹100')
    if (+amount > wallet.balance) return setErr('Insufficient balance')
    setStep(2)
  }

  const confirm = () => {
    const e = withdrawMoney(amount, method, account)
    if (e) return setErr(e)
    addToast(`₹${Number(amount).toLocaleString('en-IN')} withdrawn`, 'success')
    setStep(3)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Withdraw — Step {step}/3</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Available: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{wallet.balance.toLocaleString('en-IN')}</span></div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input className="form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Min ₹100" style={{ fontSize: 22, fontWeight: 800, textAlign: 'center' }} />
              </div>
              {err && <div className="form-error">{err}</div>}
              <button className="btn btn-primary btn-lg" disabled={!amount} onClick={next}>Next →</button>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Withdrawing ₹{Number(amount).toLocaleString('en-IN')} to:</div>
              {METHODS.map(m => (
                <div key={m.id} onClick={() => setMethod(m.label)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 10, background: method === m.label ? 'rgba(99,102,241,0.1)' : 'var(--bg3)', border: `1px solid ${method === m.label ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 24 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{m.label}</div></div>
                  {method === m.label && <span style={{ color: 'var(--accent)' }}>✓</span>}
                </div>
              ))}
              {method && (
                <div className="form-group">
                  <label className="form-label">Account / UPI ID</label>
                  <input className="form-input" value={account} onChange={e => setAccount(e.target.value)} placeholder="Enter account or UPI ID" />
                </div>
              )}
              {err && <div className="form-error">{err}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={!method || !account} onClick={confirm}>Confirm Withdrawal</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scaleIn 0.4s ease' }}>
                <CheckCircle size={32} color="var(--green)" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>₹{Number(amount).toLocaleString('en-IN')} Withdrawn!</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>to {account} via {method}</div>
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Wallet() {
  const { wallet } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [txFilter, setTxFilter] = useState('all')

  const totalReceived = wallet.transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalWithdrawn = Math.abs(wallet.transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0))

  const filtered = wallet.transactions.filter(t => txFilter === 'all' ? true : txFilter === 'received' ? t.type === 'credit' : t.type === 'debit')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Balance Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.15), rgba(249,115,22,0.08))', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 20, padding: 32, position: 'relative', overflow: 'hidden', animation: 'fadeSlideUp 0.4s ease both' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,200,66,0.1), transparent)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>Available Balance</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--gold)', marginBottom: 4, lineHeight: 1 }}>₹{wallet.balance.toLocaleString('en-IN')}</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>SilkSphere Wallet · KYC Verified ✓</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-gold btn-lg" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Money</button>
          <button className="btn btn-ghost btn-lg" onClick={() => setShowWithdraw(true)}><ArrowDownLeft size={16} /> Withdraw</button>
        </div>
      </div>

      <div className="grid-3">
        {[['Total Received', `₹${totalReceived.toLocaleString('en-IN')}`, 'var(--green)', '📥'], ['Total Withdrawn', `₹${totalWithdrawn.toLocaleString('en-IN')}`, 'var(--red)', '📤'], ['KYC Status', 'Verified ✓', 'var(--green)', '🛡️']].map(([label, val, color, icon], i) => (
          <div key={label} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><div className="stat-label">{label}</div><span style={{ fontSize: 20 }}>{icon}</span></div>
            <div className="stat-value" style={{ color, fontSize: 20 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Linked Methods */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Linked Payment Methods</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LINKED.map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 22 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>{m.id}</div>
              </div>
              <span className={`badge ${m.status === 'Active' ? 'badge-success' : 'badge-info'}`}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">Transaction History</div>
          <div className="tabs">
            {['all', 'received', 'withdrawn'].map(f => (
              <button key={f} className={`tab ${txFilter === f ? 'active' : ''}`} onClick={() => setTxFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Description</th><th>Method</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>{t.description}</td>
                  <td><span style={{ marginRight: 6 }}>{METHOD_ICONS[t.method] || '💳'}</span>{t.method}</td>
                  <td style={{ color: 'var(--text3)' }}>{t.date}</td>
                  <td style={{ fontWeight: 700, color: t.type === 'credit' ? 'var(--green)' : 'var(--red)' }}>
                    {t.type === 'credit' ? '+' : ''}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                  </td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddMoneyFlow onClose={() => setShowAdd(false)} />}
      {showWithdraw && <WithdrawFlow onClose={() => setShowWithdraw(false)} />}
    </div>
  )
}
