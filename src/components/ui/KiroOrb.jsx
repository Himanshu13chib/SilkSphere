import React, { useState } from 'react'
import { X, Droplets, Thermometer, Wind, TrendingUp } from 'lucide-react'
import SilkLogo from './SilkLogo'

const INSIGHTS = [
  { icon: Droplets, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', title: 'Humidity Forecast', text: 'Humidity expected to drop below 70% in 3 hours. Pre-activate humidifiers in Zone B.' },
  { icon: Thermometer, color: '#f97316', bg: 'rgba(249,115,22,0.15)', title: 'Temperature Optimization', text: 'Batch SS-2026-0043 (Instar 4) performs best at 26.5°C. Current: 25.8°C — slight increase recommended.' },
  { icon: Wind, color: '#22c55e', bg: 'rgba(34,197,94,0.15)', title: 'CO₂ Correction', text: '2 CO₂ correction events logged today. Ventilation schedule adjusted — next event in 4h 20m.' },
  { icon: TrendingUp, color: '#f5c842', bg: 'rgba(245,200,66,0.15)', title: 'Yield Prediction', text: 'Active batches projected to yield 174 kg cocoons. Grade A probability: 78% based on current env scores.' },
]

export default function KiroOrb() {
  const [open, setOpen] = useState(false)
  return (
    <div className="kiro-orb">
      {open && (
        <div className="kiro-panel">
          <div className="kiro-panel-header">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div className="kiro-panel-title">🪡 Kiro AI Assistant</div>
              <div className="kiro-panel-sub">4 predictive insights</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
          </div>
          {INSIGHTS.map((ins, i) => (
            <div key={i} className="kiro-insight">
              <div className="kiro-insight-icon" style={{ background: ins.bg }}>
                <ins.icon size={15} color={ins.color} />
              </div>
              <div>
                <div className="kiro-insight-title">{ins.title}</div>
                <div className="kiro-insight-text">{ins.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="kiro-orb-btn" onClick={() => setOpen(p => !p)} title="Kiro AI Assistant">
        <SilkLogo size={26} />
      </button>
    </div>
  )
}
