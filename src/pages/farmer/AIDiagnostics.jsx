import React, { useRef, useState, useEffect } from 'react'
import { Camera, Upload, X, RefreshCw, Zap, Clock, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const BACKEND_URL = 'http://127.0.0.1:8000'

export default function AIDiagnostics() {
  const { batches, addToast } = useApp()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [captured, setCaptured] = useState(null)
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [backendOnline, setBackendOnline] = useState(null)
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || '')
  const [history, setHistory] = useState([
    { id: 'SS-2026-0042', result: 'Healthy', confidence: 98, time: '10:32 AM' },
    { id: 'SS-2026-0043', result: 'Infected', confidence: 91, time: '09:15 AM' },
    { id: 'SS-2026-0061', result: 'Healthy', confidence: 95, time: '08:50 AM' },
  ])

  // Check if backend is reachable
  useEffect(() => {
    fetch(`${BACKEND_URL}/docs`, { signal: AbortSignal.timeout(2000) })
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false))
  }, [])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })
      setStream(s)
      setCameraOn(true)
      setCaptured(null)
      setResult(null)
    } catch {
      addToast('Camera access denied. Use Upload Image instead.', 'error')
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setCameraOn(false)
  }

  useEffect(() => {
    if (cameraOn && videoRef.current && stream) videoRef.current.srcObject = stream
  }, [cameraOn, stream])

  useEffect(() => () => stream?.getTracks().forEach(t => t.stop()), [])

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg')
    canvas.toBlob(blob => {
      setCaptured(dataUrl)
      setCapturedBlob(blob)
      stopCamera()
      runInference(blob, dataUrl)
    }, 'image/jpeg')
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCaptured(ev.target.result)
      setCapturedBlob(file)
      setResult(null)
      runInference(file, ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const runInference = async (imageBlob, dataUrl) => {
    setScanning(true)
    setResult(null)

    try {
      if (backendOnline) {
        // Call real FastAPI backend
        const formData = new FormData()
        formData.append('file', imageBlob, 'image.jpg')
        const res = await fetch(`${BACKEND_URL}/predict`, { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Backend error')
        const data = await res.json()
        // Response: { class_name: "Healthy" | "Grasserie", confidence: 0.95 }
        const r = {
          result: data.class_name === 'Healthy' ? 'Healthy' : 'Infected',
          confidence: Math.round((data.confidence ?? 0.9) * 100)
        }
        setResult(r)
        addToast(`AI Scan: ${r.result} (${r.confidence}% confidence)`, r.result === 'Healthy' ? 'success' : 'warning')
        setHistory(prev => [{
          id: selectedBatch,
          ...r,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...prev.slice(0, 9)])
      } else {
        // Fallback mock when backend is offline
        await new Promise(r => setTimeout(r, 2000))
        const isHealthy = Math.random() > 0.3
        const confidence = Math.floor(85 + Math.random() * 14)
        const r = { result: isHealthy ? 'Healthy' : 'Infected', confidence }
        setResult(r)
        addToast(`AI Scan (demo): ${r.result} (${confidence}%)`, isHealthy ? 'success' : 'warning')
        setHistory(prev => [{
          id: selectedBatch,
          ...r,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...prev.slice(0, 9)])
      }
    } catch (err) {
      addToast('Analysis failed. Check backend connection.', 'error')
      setResult(null)
    } finally {
      setScanning(false)
    }
  }

  const reset = () => { setCaptured(null); setCapturedBlob(null); setResult(null); stopCamera() }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Camera / Upload panel */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 2 }}>AI Disease Detection</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Capture or upload a silkworm image for analysis</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
              color: backendOnline === null ? 'var(--text3)' : backendOnline ? '#4caf50' : '#f9a825',
              background: backendOnline === null ? 'var(--bg3)' : backendOnline ? 'rgba(76,175,80,0.1)' : 'rgba(249,168,37,0.1)',
              padding: '4px 10px', borderRadius: 20, border: `1px solid ${backendOnline ? 'rgba(76,175,80,0.3)' : 'rgba(249,168,37,0.3)'}` }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {backendOnline === null ? 'Checking...' : backendOnline ? 'AI Backend Online' : 'Demo Mode'}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Select Batch</label>
            <select className="form-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
              {batches.map(b => <option key={b.id} value={b.id}>{b.id} — {b.instarStage || b.stage}</option>)}
            </select>
          </div>

          {/* Preview area */}
          <div style={{ position: 'relative', background: 'var(--bg3)', borderRadius: 12, overflow: 'hidden', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: '1px solid var(--border)' }}>
            {!cameraOn && !captured && !scanning && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text3)' }}>
                <div style={{ fontSize: 48 }}>🔬</div>
                <div style={{ fontSize: 13 }}>Open camera or upload image</div>
              </div>
            )}
            {cameraOn && !captured && (
              <>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: '#4caf50', fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
                  📷 Live · Position silkworm in frame
                </div>
              </>
            )}
            {captured && (
              <>
                <img src={captured} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {scanning && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(76,175,80,0.3)', borderTop: '3px solid #4caf50', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Analyzing...</div>
                  </div>
                )}
                {result && !scanning && (
                  <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: result.result === 'Healthy' ? 'rgba(46,125,50,0.9)' : 'rgba(198,40,40,0.9)', color: 'white', fontSize: 12, padding: '5px 14px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {result.result} · {result.confidence}% confidence
                  </div>
                )}
              </>
            )}
            {scanning && !captured && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, border: '3px solid var(--bg4)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Analyzing image...</div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {!cameraOn && !captured && (
              <>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={startCamera}><Camera size={14} /> Open Camera</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload Image</button>
              </>
            )}
            {cameraOn && (
              <>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={captureFrame}><Zap size={14} /> Capture & Analyze</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={stopCamera}><X size={14} /> Cancel</button>
              </>
            )}
            {captured && (
              <>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={reset}><RefreshCw size={14} /> New Scan</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload Image</button>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
          </div>

          {/* Result card */}
          {result && (
            <div style={{ padding: 14, borderRadius: 10, border: `1px solid ${result.result === 'Healthy' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, background: result.result === 'Healthy' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className={`badge ${result.result === 'Healthy' ? 'badge-success' : 'badge-error'}`}>
                  {result.result === 'Healthy' ? '✓ Healthy' : '⚠ Infected'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{result.confidence}% confidence</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${result.result === 'Healthy' ? 'green' : 'red'}`} style={{ width: `${result.confidence}%` }} />
              </div>
              {result.result === 'Infected' && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--red)', background: 'rgba(239,68,68,0.1)', borderRadius: 6, padding: '8px 10px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  Disease detected. Isolate batch immediately and consult veterinary guidance.
                </div>
              )}
            </div>
          )}

          {!backendOnline && backendOnline !== null && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(249,168,37,0.08)', borderRadius: 8, border: '1px solid rgba(249,168,37,0.2)', fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>
              <strong>Backend offline.</strong> Running in demo mode with simulated results.
              Start the backend: <code style={{ background: 'var(--bg3)', padding: '1px 5px', borderRadius: 3 }}>python -m uvicorn backend.main:app --reload</code>
            </div>
          )}
        </div>

        {/* Scan History */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <Clock size={14} style={{ color: 'var(--text3)' }} />
            <div>
              <div className="section-title" style={{ marginBottom: 0 }}>Scan History</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Last 10 AI diagnostic scans</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: h.result === 'Healthy' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: h.result === 'Healthy' ? '#2e7d32' : '#c62828' }}>
                  {h.result === 'Healthy' ? '✓' : '✗'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{h.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{h.time}</div>
                </div>
                <span className={`badge ${h.result === 'Healthy' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 10 }}>{h.result}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)', minWidth: 36, textAlign: 'right' }}>{h.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
