import React from 'react'
import { BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

const MONTHLY_YIELD = [
  { month: 'Oct', A: 42, B: 28, C: 10 },
  { month: 'Nov', A: 38, B: 32, C: 15 },
  { month: 'Dec', A: 55, B: 22, C: 8 },
  { month: 'Jan', A: 48, B: 30, C: 12 },
  { month: 'Feb', A: 62, B: 25, C: 6 },
  { month: 'Mar', A: 70, B: 28, C: 9 },
]

const REVENUE = [
  { month: 'Oct', revenue: 134400 },
  { month: 'Nov', revenue: 121600 },
  { month: 'Dec', revenue: 176000 },
  { month: 'Jan', revenue: 153600 },
  { month: 'Feb', revenue: 198400 },
  { month: 'Mar', revenue: 224000 },
]

const ENV_TREND = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  actual: +(78 + Math.sin(i / 4) * 8 + Math.random() * 4).toFixed(1),
  ideal: 85,
}))

const GRADE_DIST = [
  { name: 'Grade A', value: 58, color: '#f5c842' },
  { name: 'Grade B', value: 30, color: '#3b82f6' },
  { name: 'Grade C', value: 12, color: '#f97316' },
]

const totalRevenue = REVENUE.reduce((s, r) => s + r.revenue, 0)
const totalYield = MONTHLY_YIELD.reduce((s, r) => s + r.A + r.B + r.C, 0)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</div>)}
    </div>
  )
}

export default function Analytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="grid-4">
        {[
          { label: 'Total Revenue (6M)', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, color: 'var(--gold)', icon: '💰' },
          { label: 'Total Yield', value: `${totalYield} kg`, color: 'var(--green)', icon: '🫘' },
          { label: 'Grade A Batches', value: '8', color: 'var(--accent)', icon: '🏆' },
          { label: 'Avg Env Score', value: '82%', color: 'var(--blue)', icon: '📊' },
        ].map(({ label, value, color, icon }, i) => (
          <div key={label} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="stat-label">{label}</div>
              <span style={{ fontSize: 20 }}>{icon}</span>
            </div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="chart-container">
          <div className="chart-title">Monthly Yield by Grade</div>
          <div className="chart-sub">Cocoon yield (kg) — Oct 2025 to Mar 2026</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_YIELD} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text2)' }} />
              <Bar dataKey="A" name="Grade A" fill="#f5c842" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="B" name="Grade B" fill="#3b82f6" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="C" name="Grade C" fill="#f97316" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            <div className="chart-title">Grade Distribution</div>
            <div className="chart-sub">Percentage breakdown of batch grades</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={GRADE_DIST} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {GRADE_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text2)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title">Revenue Trend</div>
        <div className="chart-sub">Monthly revenue — Total: ₹{totalRevenue.toLocaleString('en-IN')}</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={REVENUE} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f5c842" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f5c842" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f5c842" fill="url(#revGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <div className="chart-title">Environmental Score Trend</div>
        <div className="chart-sub">30-day actual vs ideal score</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ENV_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 10 }} tickLine={false} interval={4} />
            <YAxis domain={[60, 100]} tick={{ fill: 'var(--text3)', fontSize: 11 }} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text2)' }} />
            <Line type="monotone" dataKey="actual" name="Actual" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ideal" name="Ideal" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
