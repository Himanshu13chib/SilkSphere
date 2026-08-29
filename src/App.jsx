import React, { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import AuthRouter from './pages/auth/AuthRouter'
import AppShell from './components/layout/AppShell'
import ToastContainer from './components/ui/ToastContainer'

function IntroVideo({ onDone }) {
  const [progress, setProgress] = React.useState(0)

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#000000",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999,
      gap: 28,
    }}>
      {/* Logo + Tagline */}
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <img src="/images/silksphere-logo.png" alt="SilkSphere Logo"
            style={{ width: 42, height: 42, objectFit: "contain" }} />
          <span style={{ fontSize: 26, fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>
            Silk<span style={{ color: "#4ade80" }}>Sphere</span>
          </span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Smart Sericulture Ecosystem
        </div>
      </div>

      {/* Video box */}
      <div style={{
        position: "relative",
        width: "58vw", maxWidth: 740, minWidth: 300,
        borderRadius: 14, overflow: "hidden",
        border: "1px solid rgba(74,222,128,0.2)",
        boxShadow: "0 0 40px rgba(74,222,128,0.08), 0 20px 50px rgba(0,0,0,0.6)"
      }}>
        <video
          src="/video/intro.mp4"
          autoPlay muted playsInline
          onEnded={onDone}
          onTimeUpdate={(e) => {
            const v = e.target
            if (v.duration) setProgress((v.currentTime / v.duration) * 100)
          }}
          style={{ width: "100%", display: "block" }}
        />
        {/* Gradient strip to cover watermark at bottom while keeping text visible */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 55,
          background: "linear-gradient(to bottom, transparent 0%, #000000 60%)"
        }}/>
        {/* SilkSphere badge covers the Gemini watermark at bottom-right */}
        <div style={{
          position: "absolute", bottom: 50, right: 10,
          background: "#000000",
          border: "1px solid rgba(74,222,128,0.3)",
          borderRadius: 8,
          padding: "5px 10px",
          display: "flex", alignItems: "center", gap: 6
        }}>
          <img src="/images/silksphere-logo.png" alt="logo"
            style={{ width: 18, height: 18, objectFit: "contain" }}/>
          <span style={{ fontSize: 11, fontWeight: 700, color: "white", letterSpacing: "0.2px" }}>
            Silk<span style={{ color: "#4ade80" }}>Sphere</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: "58vw", maxWidth: 740, minWidth: 300 }}>
        <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "linear-gradient(90deg, #16a34a, #4ade80)",
            width: `${progress}%`, transition: "width 0.3s linear"
          }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>LOADING...</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}

function Inner() {
  const { user } = useApp()
  const [showIntro, setShowIntro] = useState(true)

  const handleIntroDone = () => {
    setShowIntro(false)
  }

  if (showIntro) return <IntroVideo onDone={handleIntroDone} />

  return (
    <>
      {user ? <AppShell /> : <AuthRouter />}
      <ToastContainer />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
