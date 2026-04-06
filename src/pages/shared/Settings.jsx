import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function Settings() {
  const { user, addToast } = useApp()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [thresholds, setThresholds] = useState({ co2: 1100, maxTemp: 28, minHumidity: 70 })
  const setT = (k, v) => setThresholds(p => ({ ...p, [k]: v }))

  const saveAccount = (e) => { e.preventDefault(); addToast('Account info updated', 'success') }
  const saveThresholds = (e) => { e.preventDefault(); addToast('Alert thresholds saved', 'success') }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div className="card animate-fade-up">
        <div className="section-title" style={{ marginBottom: 16 }}>Account Information</div>
        <form onSubmit={saveAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Role</label><input className="form-input" value={user?.role} disabled style={{ opacity: 0.6 }} /></div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
        </form>
      </div>

      {user?.role === 'farmer' && (
        <div className="card animate-fade-up-2">
          <div className="section-title" style={{ marginBottom: 16 }}>Alert Thresholds</div>
          <form onSubmit={saveThresholds} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group"><label className="form-label">CO₂ Threshold (ppm)</label><input className="form-input" type="number" value={thresholds.co2} onChange={e => setT('co2', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Max Temperature (°C)</label><input className="form-input" type="number" value={thresholds.maxTemp} onChange={e => setT('maxTemp', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Min Humidity (%)</label><input className="form-input" type="number" value={thresholds.minHumidity} onChange={e => setT('minHumidity', e.target.value)} /></div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Thresholds</button>
          </form>
        </div>
      )}

      {user?.role === 'farmer' && (
        <div className="card animate-fade-up-3">
          <div className="section-title" style={{ marginBottom: 8 }}>AI Model Integration</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>Export your Keras model to TF.js and place in <code style={{ color: 'var(--accent)', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: 4 }}>public/model/</code></div>
          <pre style={{ background: 'var(--bg)', borderRadius: 10, padding: 16, fontSize: 12, color: 'var(--text2)', overflow: 'auto', lineHeight: 1.7, border: '1px solid var(--border)' }}>{`# Step 1: Install tensorflowjs converter
pip install tensorflowjs

# Step 2: Convert Keras model
tensorflowjs_converter \\
  --input_format=keras \\
  my_silkworm_model.h5 \\
  public/model/

# Step 3: Load in React
import * as tf from '@tensorflow/tfjs'
const model = await tf.loadLayersModel('/model/model.json')

# Step 4: Run inference
const tensor = tf.browser.fromPixels(imgElement)
  .resizeBilinear([224, 224])
  .expandDims(0)
  .div(255.0)
const prediction = model.predict(tensor)
const [healthy, infected] = prediction.dataSync()`}</pre>
        </div>
      )}
    </div>
  )
}
