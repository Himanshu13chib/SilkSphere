export default function GaugeChart({ value, max, unit, color = '#4caf50', label }) {
  const pct = Math.min(parseFloat(value) / max, 1)
  const startAngle = 210
  const endAngle = 210 + pct * 300
  const r = 46, cx = 60, cy = 60

  const toRad = (deg) => (deg * Math.PI) / 180
  const arcPath = (start, end) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) }
    const e = { x: cx + r * Math.cos(toRad(end)), y: cy + r * Math.sin(toRad(end)) }
    const large = (end - start) > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 120 90" width="130" height="98">
        <path d={arcPath(210, 510)} fill="none" stroke="rgba(76,175,80,0.1)" strokeWidth="9" strokeLinecap="round" />
        {pct > 0 && (
          <path d={arcPath(210, endAngle)} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}60)` }} />
        )}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--text)" fontFamily="Inter, sans-serif">
          {value}
        </text>
        <text x={cx} y={cx + 13} textAnchor="middle" fontSize="9" fill="var(--text3)" fontFamily="Inter, sans-serif">
          {unit}
        </text>
        <text x="14" y="82" fontSize="8" fill="#aaa" fontFamily="Inter, sans-serif">0</text>
        <text x="96" y="82" fontSize="8" fill="#aaa" fontFamily="Inter, sans-serif">{max}</text>
      </svg>
      {label && <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text3)', marginTop: -4 }}>{label}</div>}
    </div>
  )
}
