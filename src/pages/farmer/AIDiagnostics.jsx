import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { Camera, Upload, Zap, X } from 'lucide-react'

export default function AIDiagnostics() {
  const { batches, addToast } = useApp()
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || '')
  const [cameraActive, setCameraActive] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([
    { id: 1, batchId: 'SS-2026-0042', result: 'Healthy', confidence: 100, time: 'Mar 19, 2026 09:00' },
    { id: 2, batchId: 'SS-2026-0057', result: 'Healthy', confidence: 94, time: 'Mar 18, 2026 14:30' },
    { id: 3, batchId: 'SS-2026-0043', result: 'Healthy', confidence: 97, time: 'Mar 17, 2026 11:00' },
    { id: 4, batchId: 'SS-2026-0061', result: 'Infected', confidence: 78, time: 'Mar 16, 2026 16:00' },
    { id: 5, batchId: 'SS-2026-0056', result: 'Infected', confidence: 82, time: 'Mar 15, 2026 10:00' },
  ])
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileRef = useRef(null)

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      addToast('Camera access denied or unavailable', 'error')
    }
  }

  const closeCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setCameraActive(false)
  }

  useEffect(() => () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()) }, [])

  const analyze = async () => {
    setAnalyzing(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 2000))
    const healthy = Math.random() > 0.25
    const confidence = Math.floor(healthy ? 88 + Math.random() * 12 : 70 + Math.random() * 20)
    const res = { result: healthy ? 'Healthy' : 'Infected', confidence, batchId: selectedBatch }
    setResult(res)
    setHistory(p => [{ id: Date.now(), ...res, time: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }, ...p.slice(0, 9)])
    addToast(`AI Scan: ${res.result} (${confidence}% confidence)`, healthy ? 'success' : 'warning')
    setAnalyzing(false)
  }

  const handleUpload = (e) => {
    if (e.target.files?.[0]) analyze()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Camera Panel */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4 }}>AI Disease Detection</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Capture or upload silkworm image for analysis</div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Select Batch</label>
            <select className="form-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
              {batches.map(b => <option key={b.id} value={b.id}>{b.id} — {b.instarStage}</option>)}
            </select>
          </div>

          <div style={{ position: 'relative', background: 'var(--bg3)', borderRadius: 12, overflow: 'hidden', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: '1px solid var(--border)' }}>
            {cameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', top: 12, left: 12, width: 20, height: 20, borderTop: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)', borderRadius: '2px 0 0 0' }} />
                  <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderTop: '2px solid var(--accent)', borderRight: '2px solid var(--accent)', borderRadius: '0 2px 0 0' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, width: 20, height: 20, borderBottom: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)', borderRadius: '0 0 0 2px' }} />
                  <div style={{ position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderBottom: '2px solid var(--accent)', borderRight: '2px solid var(--accent)', borderRadius: '0 0 2px 0' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', animation: 'scanLine 2s linear infinite', top: 0 }} />
                </div>
              </>
            ) : analyzing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, border: '3px solid var(--bg4)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Analyzing image...</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Running AI inference model</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text3)' }}>
                <div style={{ fontSize: 48 }}>🔬</div>
                <div style={{ fontSize: 13 }}>Open camera or upload image</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {!cameraActive ? (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={openCamera}><Camera size={14} /> Open Camera</button>
            ) : (
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={closeCamera}><X size={14} /> Close Camera</button>
            )}
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload Image</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
          </div>

          {cameraActive && (
            <button className="btn btn-gold" style={{ width: '100%' }} onClick={analyze} disabled={analyzing}>
              <Zap size={14} /> Capture & Analyze
            </button>
          )}

          {result && (
            <div style={{ marginTop: 14, padding: 16, borderRadius: 10, border: `1px solid ${result.result === 'Healthy' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, background: result.result === 'Healthy' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className={`badge ${result.result === 'Healthy' ? 'badge-success' : 'badge-error'}`}>{result.result === 'Healthy' ? '✓ Healthy' : '⚠ Infected'}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{result.confidence}% confidence</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${result.result === 'Healthy' ? 'green' : 'red'}`} style={{ width: `${result.confidence}%` }} />
              </div>
              {result.result === 'Infected' && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--red)', background: 'rgba(239,68,68,0.1)', borderRadius: 6, padding: '8px 10px' }}>
                  ⚠️ Disease detected. Isolate batch immediately and consult veterinary guidance.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scan History */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4 }}>Scan History</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Last 10 AI diagnostic scans</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {history.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.result === 'Healthy' ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono' }}>{h.batchId}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{h.time}</div>
                </div>
                <span className={`badge ${h.result === 'Healthy' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 10 }}>{h.result}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)', minWidth: 40, textAlign: 'right' }}>{h.confidence}%</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 14, background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🔧 Integrate Real TF.js Model</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>Export your Keras model and place in <code style={{ color: 'var(--accent)', background: 'rgba(99,102,241,0.1)', padding: '1px 4px', borderRadius: 3 }}>public/model/</code></div>
            <pre style={{ fontSize: 10, color: 'var(--text2)', background: 'var(--bg)', borderRadius: 6, padding: 10, overflow: 'auto', lineHeight: 1.6 }}>{`import * as tf from '@tensorflow/tfjs'
const model = await tf.loadLayersModel('/model/model.json')
const tensor = tf.browser.fromPixels(imgEl)
  .resizeBilinear([224, 224])
  .expandDims(0).div(255)
const pred = model.predict(tensor)
const [healthy, infected] = pred.dataSync()`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
