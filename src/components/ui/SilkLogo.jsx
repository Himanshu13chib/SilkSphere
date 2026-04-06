import React from 'react'

// Silk-themed logo: cocoon with thread spiral
export default function SilkLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="silkBg" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#66bb6a" />
          <stop offset="100%" stopColor="#1b5e20" />
        </radialGradient>
      </defs>
      {/* Circle background */}
      <circle cx="20" cy="20" r="20" fill="url(#silkBg)" />
      {/* Cocoon shape */}
      <ellipse cx="20" cy="21" rx="9" ry="13" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" />
      {/* Silk thread spiral — outer */}
      <path
        d="M20 8 C26 8 29 12 29 17 C29 22 26 26 20 28 C14 26 11 22 11 17 C11 12 14 8 20 8"
        fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="2 2"
      />
      {/* Thread unwinding from top */}
      <path
        d="M20 8 C22 6 25 5 27 7 C29 9 28 12 26 13"
        fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinecap="round"
      />
      {/* Inner silk S-curve */}
      <path
        d="M17 14 C17 12 23 12 23 16 C23 20 17 20 17 24 C17 28 23 28 23 26"
        fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"
      />
      {/* Small dot at thread end */}
      <circle cx="27" cy="7" r="1.5" fill="rgba(255,255,255,0.9)" />
    </svg>
  )
}
