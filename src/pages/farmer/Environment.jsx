import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { Activity, Thermometer, Droplets, Wind, Zap } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'

// Generate 24h history
function gen24h() {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    temp: +(24 + Math.sin(i / 3) * 2.5 + Math.random() * 0.8).toFixed(1),
    humidity: +(76 + Math.cos(i / 4) * 6 + Math.random() * 1.5).toFixed(1),
    co2: Math.floor(850 + Math.sin(i / 2) * 180 + Math.random() * 60),
  }))
}

// 7-day daily averages
const DAILY_AVG = [
  { day: 'Mon', temp: 25.4, humidity: 78, co2: 920 },
  { day: 'Tue', temp: 26.1, humidity: 75, co2: 980 },
  { day: 'Wed', temp: 25.8, humidity: 80, co2: 870 },
  { day: 'Thu', temp: 27.2, humidity: 72, co2: 1050 },
  { day: 'Fri', temp: 26.5, humidity: 77, co2: 940 },
  { day: 'Sat', temp: 25.9, humidity: 79, co2: 900 },
  { day: 'Sun', temp: 26.3, humidity: 76, co2: 960 },
]

// 30-day env score
const ENV_SCORE_30 = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  score: +(78 + Math.sin(i / 4) * 8 + Math.random() * 4).toFixed(1),
  ideal: 85,
}))

// Hourly CO2 bar data
const CO2_HOURLY = Array.from({ length: 12 }, (_, i) => ({
  hour: `${String(i * 2).padStart(2, '0')}:00`,
  co2: Math.floor(820 + Math.sin(i / 2) * 200 + Math.random() * 80),
}))

const INITIAL_EVENTS = [
  { id: 1, type: 'success', text: 'AI Scan completed — SS-2026-0042 Healthy (100%)', time: '2 min ago' },
  { id: 2, type: 'warning', text: 'CO₂ spike detected in Zone B — ventilation activated', time: '8 min ago' },
  { id: 3, type: 'info', text: 'Grade A certification issued for SS-2026-0057', time: '22 min ago' },
  { id: 4, type: 'success', text: 'Order ORD-001 confirmed — ₹64,000', time: '1 hr ago' },
  { id: 5, type: 'info', text: 'Sensor node heartbeat — all 4 nodes online', time: '1 hr ago' },
  { id: 6, type: 'warning', text: 'Humidity dipped to 71% — humidifier triggered', time: '2 hr ago' },
  { id: 7, type: 'success', text: 'Temperature stabilized at 26°C in Zone A', time: '3 hr ago' },
  { id: 8, type: 'info', text: 'Batch SS-2026-0043 entered Instar 4 stage', time: '4 hr ago' },
]

const NEW_EVENTS = [
  { type: 'info', text: 'Scheduled feeding reminder — Batch SS-2026-0043' },
  { type: 'success', text: 'Humidity stabilized at 78% in Zone A' },
  { type: 'warning', text: 'Temperature approaching upper threshold (27.8°C)' },
  { type: 'info', text: 'AI Scan queued for SS-2026-0061' },
  { type: 'success', text: 'Batch SS-2026-0057 entered Instar 3 stage' },
  { type: 'warning', text: 'CO₂ at 1080 ppm — approaching threshold' },
  { type: 'info', text: 'Ventilation cycle completed — Zone C' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#1a1a1a' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}{p.name === 'Temp' ? '°C' : p.name === 'Humidity' ? '%' : p.name === 'CO₂' ? ' ppm' : ''}</strong>
        </div>
      ))}
    </div>
  )
}

export default function Environment() {
  const { sensor } = useApp()
  const [history] = useState(gen24h)
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [range, setRange] = useState('24h')
  const eventIdx = useRef(0)

  useEffect(() => {
    const t = setInterval(() => {
      const ev = NEW_EVENTS[eventIdx.current % NEW_EVENTS.length]
      eventIdx.current++
      setEvents(p => [{ id: Date.now(), ...ev, time: 'just now', fresh: true }, ...p.slice(0, 14)])
    }, 12000)
    return () => clearInterval(t)
  }, [])

  // KPI summary from history
  const avgTemp = (history.reduce((s, h) => s + h.temp, 0) / history.length).toFixed(1)
  const avgHum = (history.reduce((s, h) => s + h.humidity, 0) / history.length).toFixed(1)
  const avgCo2 = Math.floor(history.reduce((s, h) => s + h.co2, 0) / history.length)
  const maxCo2 = Math.max(...history.map(h => h.co2))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>Environment Monitor</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Real-time sensor data & historical trends</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['24h', '7d', '30d'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
                background: range === r ? '#2e7d32' : 'white',
                color: range === r ? 'white' : '#555',
                borderColor: range === r ? '#2e7d32' : '#e0e0e0'
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid-4">
        {[
          { label: 'Avg Temperature', value: `${avgTemp}°C`, icon: Thermometer, color: '#f57c00', bg: '#fff3e0', ideal: '24–27°C' },
          { label: 'Avg Humidity', value: `${avgHum}%`, icon: Droplets, color: '#1976d2', bg: '#e3f2fd', ideal: '70–85%' },
          { label: 'Avg CO₂', value: `${avgCo2} ppm`, icon: Wind, color: '#7b1fa2', bg: '#f3e5f5', ideal: '< 1100 ppm' },
          { label: 'Peak CO₂', value: `${maxCo2} ppm`, icon: Zap, color: maxCo2 > 1100 ? '#d32f2f' : '#2e7d32', bg: maxCo2 > 1100 ? '#ffebee' : '#e8f5e9', ideal: maxCo2 > 1100 ? '⚠ Exceeded' : '✓ Normal' },
        ].map(({ label, value, icon: Icon, color, bg, ideal }, i) => (
          <div key={label} className="stat-card" style={{ animationDelay: `${i * 0.07}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-label">{label}</div>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
            </div>
            <div className="stat-value" style={{ color, fontSize: 22 }}>{value}</div>
            <div className="stat-sub">{ideal}</div>
          </div>
        ))}
      </div>

      {/* 24h Temperature + Humidity area chart */}
      <div className="chart-container animate-fade-up-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div className="chart-title">Temperature & Humidity — 24h</div>
            <div className="chart-sub">Hourly readings with ideal reference lines</div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: '#f57c00', display: 'inline-block', borderRadius: 2 }} />Temperature</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: '#4caf50', display: 'inline-block', borderRadius: 2 }} />Humidity</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={history} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f57c00" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#f57c00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4caf50" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fill: '#aaa', fontSize: 10 }} tickLine={false} interval={3} />
            <YAxis tick={{ fill: '#aaa', fontSize: 10 }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={26} stroke="#f57c00" strokeDasharray="5 3" strokeOpacity={0.5} label={{ value: 'Ideal Temp', fill: '#f57c00', fontSize: 9, position: 'insideTopRight' }} />
            <ReferenceLine y={78} stroke="#4caf50" strokeDasharray="5 3" strokeOpacity={0.5} label={{ value: 'Ideal Hum', fill: '#4caf50', fontSize: 9, position: 'insideTopRight' }} />
            <Area type="monotone" dataKey="temp" name="Temp" stroke="#f57c00" fill="url(#gTemp)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#4caf50" fill="url(#gHum)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CO2 bar chart + 7-day daily averages side by side */}
      <div className="grid-2">
        {/* CO2 hourly bar */}
        <div className="chart-container animate-fade-up-3">
          <div className="chart-title">CO₂ Level — Hourly</div>
          <div className="chart-sub">Every 2 hours · threshold at 1100 ppm</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CO2_HOURLY} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#aaa', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#aaa', fontSize: 10 }} tickLine={false} domain={[600, 1400]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={1100} stroke="#d32f2f" strokeDasharray="4 3" label={{ value: 'Threshold', fill: '#d32f2f', fontSize: 9 }} />
              <Bar dataKey="co2" name="CO₂" radius={[4, 4, 0, 0]}>
                {CO2_HOURLY.map((entry, i) => (
                  <Cell key={i} fill={entry.co2 > 1100 ? '#ef5350' : entry.co2 > 950 ? '#f59e0b' : '#4caf50'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 7-day daily averages bar */}
        <div className="chart-container animate-fade-up-4">
          <div className="chart-title">7-Day Daily Averages</div>
          <div className="chart-sub">Temperature · Humidity · CO₂ per day</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DAILY_AVG} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#aaa', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#aaa', fontSize: 10 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#888' }} />
              <Bar dataKey="temp" name="Temp" fill="#f57c00" radius={[3, 3, 0, 0]} />
              <Bar dataKey="humidity" name="Humidity" fill="#4caf50" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-day env score line chart */}
      <div className="chart-container">
        <div className="chart-title">Environmental Score — 30 Days</div>
        <div className="chart-sub">Actual score vs ideal (85%) — March 2026</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ENV_SCORE_30} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fill: '#aaa', fontSize: 9 }} tickLine={false} interval={4} />
            <YAxis domain={[60, 100]} tick={{ fill: '#aaa', fontSize: 10 }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#888' }} />
            <ReferenceLine y={85} stroke="#4caf50" strokeDasharray="5 3" strokeOpacity={0.6} />
            <Line type="monotone" dataKey="score" name="Actual Score" stroke="#2e7d32" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#2e7d32' }} />
            <Line type="monotone" dataKey="ideal" name="Ideal (85%)" stroke="#4caf50" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Live Activity Feed */}
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">Live Activity Feed</div>
            <div className="section-sub">Real-time farm events & alerts</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#2e7d32', background: '#e8f5e9', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(46,125,50,0.2)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4caf50', animation: 'pulse 2s infinite' }} />
            Live
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {events.map((ev, i) => (
            <div key={ev.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '10px 0',
              borderBottom: i < events.length - 1 ? '1px solid #f5f5f5' : 'none',
              animation: ev.fresh ? 'slideInLeft 0.4s ease' : 'none'
            }}>
              {/* Color dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                background: ev.type === 'success' ? '#4caf50' : ev.type === 'warning' ? '#f59e0b' : '#1976d2'
              }} />
              {/* Type badge */}
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                background: ev.type === 'success' ? '#e8f5e9' : ev.type === 'warning' ? '#fff8e1' : '#e3f2fd',
                color: ev.type === 'success' ? '#2e7d32' : ev.type === 'warning' ? '#e65100' : '#1565c0',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {ev.type}
              </span>
              <div style={{ flex: 1, fontSize: 13, color: '#333', lineHeight: 1.4 }}>{ev.text}</div>
              <div style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap', marginTop: 1 }}>{ev.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
