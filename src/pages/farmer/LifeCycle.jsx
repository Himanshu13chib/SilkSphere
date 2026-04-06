import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { ChevronRight, X } from 'lucide-react'

export default function LifeCycle() {
  const { lifecycleStages } = useApp()
  const [selected, setSelected] = useState(lifecycleStages.find(s => s.active) || lifecycleStages[3])
  const [showHistory, setShowHistory] = useState(false)
  const activeIdx = lifecycleStages.findIndex(s => s.active)
  const overallPct = Math.round(((activeIdx + 0.5) / lifecycleStages.length) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero Progress Strip */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: 24, animation: 'fadeSlideUp 0.4s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Stage</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{lifecycleStages[activeIdx].emoji} {lifecycleStages[activeIdx].name}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{lifecycleStages[activeIdx].dayRange}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>{overallPct}%</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Overall Progress</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {lifecycleStages.map((s, i) => (
            <div key={s.id} onClick={() => setSelected(s)} style={{ flex: 1, height: 6, borderRadius: 3, background: s.completed ? 'var(--green)' : s.active ? 'var(--accent)' : 'var(--bg4)', cursor: 'pointer', transition: 'all 0.3s', position: 'relative' }}>
              {s.active && <div style={{ position: 'absolute', inset: 0, borderRadius: 3, background: 'var(--accent)', animation: 'pulse 2s infinite' }} />}
            </div>
          ))}
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div className="progress-fill accent" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Stage Cards Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="section-title">Life Cycle Stages</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowHistory(p => !p)}>
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
          <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {lifecycleStages.map((s, i) => (
              <div key={s.id} onClick={() => setSelected(s)} style={{ background: selected?.id === s.id ? 'rgba(99,102,241,0.12)' : 'var(--bg2)', border: `1px solid ${selected?.id === s.id ? 'rgba(99,102,241,0.4)' : s.active ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`, borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', animation: `fadeSlideUp 0.4s ease ${i * 0.05}s both` }}>
                {s.active && (
                  <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase' }}>Active</span>
                  </div>
                )}
                {s.completed && !s.active && (
                  <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 14 }}>✅</div>
                )}
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{s.dayRange}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4, marginBottom: 10 }}>{s.description}</div>
                <div className="progress-bar">
                  <div className="progress-fill accent" style={{ width: s.completed ? '100%' : s.active ? '55%' : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Panel */}
        {showHistory && selected && (
          <div style={{ width: 300, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, overflow: 'hidden', position: 'sticky', top: 80, animation: 'slideInLeft 0.3s ease', flexShrink: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.emoji} {selected.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{selected.dayRange}</div>
              </div>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Environmental Metrics</div>
              <div className="grid-2" style={{ gap: 8, marginBottom: 16 }}>
                {[['🌡️', 'Temp', selected.metrics.temp], ['💧', 'Humidity', selected.metrics.humidity], ['💨', 'CO₂', selected.metrics.co2], ['💀', 'Mortality', selected.metrics.mortality]].map(([icon, label, val]) => (
                  <div key={label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Event Log</div>
              {selected.events.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>No events yet for this stage</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {selected.events.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: 12, position: 'relative' }}>
                      {i < selected.events.length - 1 && <div style={{ position: 'absolute', left: 7, top: 16, bottom: 0, width: 1, background: 'var(--border)' }} />}
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: ev.type === 'success' ? 'var(--green)' : ev.type === 'warning' ? 'var(--orange)' : 'var(--blue)', flexShrink: 0, marginTop: 2, zIndex: 1 }} />
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{ev.time}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>{ev.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Flow Diagram */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Full Lifecycle Flow</div>
        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content' }}>
            {lifecycleStages.map((s, i) => (
              <React.Fragment key={s.id}>
                <div onClick={() => setSelected(s)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 16px', borderRadius: 10, background: s.active ? 'rgba(99,102,241,0.15)' : selected?.id === s.id ? 'rgba(99,102,241,0.08)' : 'var(--bg3)', border: `1px solid ${s.active ? 'rgba(99,102,241,0.4)' : selected?.id === s.id ? 'rgba(99,102,241,0.2)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s', minWidth: 90, position: 'relative' }}>
                  {s.active && <div style={{ position: 'absolute', inset: -1, borderRadius: 10, border: '1px solid var(--accent)', animation: 'pulse 2s infinite', pointerEvents: 'none' }} />}
                  <div style={{ fontSize: 22 }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, textAlign: 'center' }}>{s.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)' }}>{s.dayRange}</div>
                  {s.completed && <div style={{ fontSize: 10 }}>✅</div>}
                </div>
                {i < lifecycleStages.length - 1 && (
                  <ChevronRight size={16} color="var(--text3)" style={{ flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
