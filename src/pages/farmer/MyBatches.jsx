import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Plus, X, Award } from 'lucide-react'

const INSTAR_STAGES = ['Egg', 'Instar 1', 'Instar 2', 'Instar 3', 'Instar 4', 'Instar 5', 'Spinning', 'Cocoon']

function GradeModal({ batch, onClose }) {
  const { gradeBatch, addToast } = useApp()
  const [grade, setGrade] = useState('')
  const grades = [
    { id: 'A', label: 'Grade A', sub: 'Premium', color: 'var(--gold)', bg: 'rgba(245,200,66,0.1)', border: 'rgba(245,200,66,0.3)', min: 85 },
    { id: 'B', label: 'Grade B', sub: 'Standard', color: 'var(--blue)', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', min: 70 },
    { id: 'C', label: 'Grade C', sub: 'Economy', color: 'var(--orange)', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', min: 0 },
  ]
  const confirm = () => {
    if (!grade) return
    gradeBatch(batch.id, grade)
    addToast(`Batch ${batch.id} graded ${grade} and listed on marketplace`, 'success')
    onClose()
  }
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Grade & List Batch</div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Env Score</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{batch.envScore}%</div>
            </div>
            <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>AI Health</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)' }}>{batch.aiScore}%</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Select Grade</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grades.map(g => (
              <div key={g.id} onClick={() => setGrade(g.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 10, background: grade === g.id ? g.bg : 'var(--bg3)', border: `1px solid ${grade === g.id ? g.border : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: g.color }}>{g.id}</div>
                <div>
                  <div style={{ fontWeight: 700, color: g.color }}>{g.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{g.sub}</div>
                </div>
                {grade === g.id && <div style={{ marginLeft: 'auto', color: g.color }}>✓</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!grade} onClick={confirm}><Award size={14} /> Confirm & List</button>
        </div>
      </div>
    </div>
  )
}

function NewBatchModal({ onClose }) {
  const { addBatch, addToast } = useApp()
  const [form, setForm] = useState({ farmName: '', instarStage: 'Instar 1', quantity: '', notes: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.farmName || !form.quantity) return
    const id = addBatch(form)
    addToast(`Batch ${id} created successfully`, 'success')
    onClose()
  }
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">New Batch</div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group"><label className="form-label">Farm Name</label><input className="form-input" value={form.farmName} onChange={e => set('farmName', e.target.value)} placeholder="e.g. Green Silk Farm" required /></div>
            <div className="form-group"><label className="form-label">Instar Stage</label>
              <select className="form-select" value={form.instarStage} onChange={e => set('instarStage', e.target.value)}>
                {INSTAR_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Quantity (kg)</label><input className="form-input" type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="e.g. 40" required /></div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." rows={3} style={{ resize: 'vertical' }} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"><Plus size={14} /> Create Batch</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MyBatches() {
  const { batches } = useApp()
  const [gradeTarget, setGradeTarget] = useState(null)
  const [showNew, setShowNew] = useState(false)

  const total = batches.length
  const active = batches.filter(b => b.status === 'active').length
  const listed = batches.filter(b => b.status === 'listed').length
  const alerts = batches.filter(b => b.envScore < 70 || b.aiScore < 75).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="grid-4">
        {[['Total Batches', total, 'var(--accent)', '📦'], ['Active', active, 'var(--green)', '🟢'], ['Ready to List', listed, 'var(--gold)', '🏷️'], ['Active Alerts', alerts, 'var(--red)', '⚠️']].map(([label, val, color, icon], i) => (
          <div key={label} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-label">{label}</div>
              <div style={{ fontSize: 20 }}>{icon}</div>
            </div>
            <div className="stat-value" style={{ color }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">All Batches</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}><Plus size={14} /> New Batch</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Batch ID</th><th>Stage</th><th>Env Score</th><th>AI Health</th><th>Grade</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.id}>
                  <td><span className="mono">{b.id}</span></td>
                  <td>{b.instarStage}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill green" style={{ width: `${b.envScore}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{b.envScore}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill gold" style={{ width: `${b.aiScore}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{b.aiScore}%</span>
                    </div>
                  </td>
                  <td>{b.grade ? <span className={`badge badge-${b.grade}`}>Grade {b.grade}</span> : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>
                    {b.status === 'active' && (
                      <button className="btn btn-gold btn-sm" onClick={() => setGradeTarget(b)}><Award size={12} /> Grade</button>
                    )}
                    {b.status === 'listed' && <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ Listed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {gradeTarget && <GradeModal batch={gradeTarget} onClose={() => setGradeTarget(null)} />}
      {showNew && <NewBatchModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
