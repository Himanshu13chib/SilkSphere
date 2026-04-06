import React, { useEffect, useState } from 'react'

export default function SvgGauge({ value, min, max, unit, color, label, size = 130 }) {
  const [animated, setAnimated] = useState(min)
  const r = 44
  const circumference = Math.PI * r
  const pct = Math.min(1, Math.max(0, (animated - min) / (max - min)))
  const offset = circumference * (1 - pct)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg width={size} height={size * 0.68} viewBox="0 0 120 82">
        {/* Track */}
        <path d="M 16 72 A 44 44 0 0 1 104 72" fill="none" stroke="#e8e8e8" strokeWidth="10" strokeLinecap="round" />
        {/* Fill */}
        <path
          d="M 16 72 A 44 44 0 0 1 104 72"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Min label */}
        <text x="12" y="80" textAnchor="middle" fill="#aaa" fontSize="8" fontFamily="Inter">0</text>
        {/* Max label */}
        <text x="108" y="80" textAnchor="middle" fill="#aaa" fontSize="8" fontFamily="Inter">{max}</text>
        {/* Value */}
        <text x="60" y="64" textAnchor="middle" fill="#1a1a1a" fontSize="17" fontWeight="800" fontFamily="Inter">
          {typeof animated === 'number' ? (animated % 1 === 0 ? animated : animated.toFixed(1)) : animated}
        </text>
        {/* Unit */}
        <text x="60" y="76" textAnchor="middle" fill="#888" fontSize="8" fontFamily="Inter">{unit}</text>
      </svg>
      <div style={{ fontSize: 12, color: '#555', fontWeight: 600, textAlign: 'center' }}>{label}</div>
    </div>
  )
}
