import React, { useState, useEffect, useRef } from "react"
import { useApp } from "../../context/AppContext"
import { AlertTriangle, Camera, Upload } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts"
import SvgGauge from "../../components/ui/SvgGauge"

const HISTORY = Array.from({ length: 24 }, (_, i) => ({
  time: String(i).padStart(2,"0") + ":00",
  temp: +(24 + Math.sin(i/3)*2 + Math.random()).toFixed(1),
  humidity: +(76 + Math.cos(i/4)*5 + Math.random()).toFixed(1),
}))

const INITIAL_EVENTS = [
  { id:1, type:"success", text:"AI Scan completed - SS-2026-0042 Healthy (100%)", time:"2 min ago" },
  { id:2, type:"warning", text:"CO2 spike detected in Zone B - ventilation activated", time:"8 min ago" },
  { id:3, type:"info", text:"Grade A certification issued for SS-2026-0057", time:"22 min ago" },
  { id:4, type:"success", text:"Order ORD-001 confirmed - Rs.64,000", time:"1 hr ago" },
  { id:5, type:"info", text:"Sensor node heartbeat - all 4 nodes online", time:"1 hr ago" },
]

const NEW_EVENTS = [
  { type:"info", text:"Scheduled feeding reminder - Batch SS-2026-0043" },
  { type:"success", text:"Humidity stabilized at 78% in Zone A" },
  { type:"warning", text:"Temperature approaching upper threshold (27.8C)" },
  { type:"info", text:"AI Scan queued for SS-2026-0061" },
  { type:"success", text:"Batch SS-2026-0057 entered Instar 3 stage" },
]

function useCountdown(target) {
  const [remaining, setRemaining] = useState(target)
  useEffect(() => {
    const t = setInterval(() => setRemaining(p => p <= 0 ? target : p - 1), 1000)
    return () => clearInterval(t)
  }, [target])
  const h = Math.floor(remaining/3600), m = Math.floor((remaining%3600)/60), s = remaining%60
  return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")
}

function CountdownCard({ label, seconds, color, icon }) {
  const time = useCountdown(seconds)
  return (
    <div className="card" style={{textAlign:"center"}}>
      <div style={{fontSize:20,marginBottom:6}}>{icon}</div>
      <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:20,fontWeight:700,color}}>{time}</div>
      <div style={{fontSize:11,color:"#888",marginTop:4,textTransform:"uppercase",letterSpacing:"0.6px"}}>{label}</div>
    </div>
  )
}

function DiagnosticsImage({ scanResult }) {
  return (
    <div style={{position:"relative",width:"100%",height:210,borderRadius:8,overflow:"hidden",background:"#2d5a1b"}}>
      <img src="/images/silkworm.jpg" alt="Silkworm" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} />
      {scanResult && (
        <div style={{position:"absolute",top:10,left:10,background:"rgba(46,125,50,0.92)",color:"white",padding:"4px 12px",borderRadius:6,fontSize:12,fontWeight:700}}>
          {scanResult}
        </div>
      )}
      <div style={{position:"absolute",top:"18%",left:"22%",width:"50%",height:"60%",border:"2px solid #00e5ff",borderRadius:3,pointerEvents:"none",boxShadow:"0 0 10px rgba(0,229,255,0.35)"}} />
      <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,borderTop:"1px dashed rgba(255,255,255,0.3)"}} />
        <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,borderLeft:"1px dashed rgba(255,255,255,0.3)"}} />
      </div>
    </div>
  )
}

const getZoneStatusColor = (temp, humidity, co2, stage) => {
  let targetTemp = 25.5, targetHum = 77.0, maxCo2 = 1100
  if (stage === 'Egg') { targetTemp = 24.0; targetHum = 80.0; maxCo2 = 1000 }
  else if (stage?.includes('Instar 1') || stage?.includes('Instar 2')) { targetTemp = 25.0; targetHum = 81.0; maxCo2 = 1000 }
  else if (stage?.includes('Instar 3') || stage?.includes('Instar 4')) { targetTemp = 26.0; targetHum = 77.0; maxCo2 = 1100 }
  else if (stage?.includes('Instar 5')) { targetTemp = 27.0; targetHum = 74.0; maxCo2 = 1100 }
  else if (stage?.includes('Spinning')) { targetTemp = 27.0; targetHum = 70.0; maxCo2 = 1100 }
  else if (stage?.includes('Cocoon')) { targetTemp = 25.0; targetHum = 68.0; maxCo2 = 1000 }

  const tDiff = Math.abs(temp - targetTemp)
  const hDiff = Math.abs(humidity - targetHum)

  if (tDiff > 2.5 || hDiff > 8.0 || co2 > maxCo2 + 100) return 'red'
  if (tDiff > 1.2 || hDiff > 4.0 || co2 > maxCo2) return 'yellow'
  return 'green'
}

export default function Dashboard({ setPage }) {
  const { sensor, batches, predictions, controlStatus, setManualControl } = useApp()
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const eventIdx = useRef(0)
  const activeBatch = batches.find(b => b.status === "active") || batches[0]
  const hasAlert = sensor.co2 > 1100 || sensor.temperature > 27.5

  useEffect(() => {
    const t = setInterval(() => {
      const ev = NEW_EVENTS[eventIdx.current % NEW_EVENTS.length]
      eventIdx.current++
      setEvents(p => [{ id:Date.now(), ...ev, time:"just now", fresh:true }, ...p.slice(0,9)])
    }, 12000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {hasAlert && (
        <div className="alert-banner warning">
          <AlertTriangle size={15} />
          {sensor.co2 > 1100 ? "CO2 at "+sensor.co2+" ppm exceeds threshold" : "Temperature at "+sensor.temperature+"C"}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:16,width:"100%",alignItems:"stretch"}}>
        {activeBatch && (
          <div style={{background:"white",border:"1px solid #e0e0e0",borderRadius:12,padding:"16px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:18,fontWeight:700}}>Batch Overview: {activeBatch.id} (Active - {activeBatch.instarStage})</div>
            <div style={{display:"flex",gap:20,marginTop:8,flexWrap:"wrap"}}>
              <span style={{fontSize:13,color:"#555"}}>Env Score: <strong style={{color:"#2e7d32"}}>{activeBatch.envScore}%</strong></span>
              <span style={{fontSize:13,color:"#555"}}>AI Health: <strong style={{color:"#2e7d32"}}>{activeBatch.aiScore}%</strong></span>
              <span style={{fontSize:13,color:"#555"}}>Grade: <span className={"badge badge-"+(activeBatch.grade||"B")}>Grade {activeBatch.grade||"?"}</span></span>
              <span style={{fontSize:13,color:"#555"}}>Qty: <strong>{activeBatch.quantity} kg</strong></span>
            </div>
          </div>
        )}

        <div style={{background:"white",border:"1px solid #e0e0e0",borderRadius:12,padding:"16px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--green)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
            🔮 Predicted State — Next 24-48 Hrs
          </div>
          {predictions ? (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:13}}>
              <div>
                <div style={{color:"#888",fontSize:11,textTransform:"uppercase",letterSpacing:"0.3px"}}>Expected Growth</div>
                <div style={{fontWeight:600,marginTop:3}}>
                  24h: <span style={{color:"#2e7d32"}}>{predictions.predicted_stage_24h}</span> ({predictions.predicted_progress_24h}%)
                </div>
                <div style={{fontWeight:600,marginTop:2}}>
                  48h: <span style={{color:"#2e7d32"}}>{predictions.predicted_stage_48h}</span> ({predictions.predicted_progress_48h}%)
                </div>
              </div>
              <div>
                <div style={{color:"#888",fontSize:11,textTransform:"uppercase",letterSpacing:"0.3px"}}>Expected Quality</div>
                <div style={{marginTop:3,fontWeight:600}}>
                  Cocoon Grade: <span className={`badge badge-${predictions.expected_cocoon_grade || 'B'}`}>Grade {predictions.expected_cocoon_grade || 'B'}</span>
                </div>
                <div style={{marginTop:2,fontSize:11,color:"#666"}}>
                  Env Compliance: <strong>{predictions.env_compliance_score}%</strong>
                </div>
              </div>
            </div>
          ) : (
            <div style={{fontSize:12,color:"#888",fontStyle:"italic"}}>Calculating developmental predictions...</div>
          )}
        </div>
      </div>

      <div>
        <div className="section-header"><div className="section-title">Seri-Assistant Schedule</div></div>
        <div className="grid-4">
          <CountdownCard label="Next Feeding" seconds={7200} color="#2e7d32" icon="🌿" />
          <CountdownCard label="Cleaning" seconds={19200} color="#1976d2" icon="🧹" />
          <CountdownCard label="Harvest" seconds={176400} color="#f59e0b" icon="🫘" />
          <CountdownCard label="AI Scan" seconds={4600} color="#7b1fa2" icon="🔬" />
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:600}}>Temperature</span><span style={{color:"#ccc"}}>...</span>
            </div>
            <div style={{display:"flex",justifyContent:"center"}}>
              <SvgGauge value={sensor.temperature} min={0} max={170} unit="C" color="#4caf50" label="Temperature" size={140} />
            </div>
          </div>
          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:600}}>Humidity</span><span style={{color:"#ccc"}}>...</span>
            </div>
            <div style={{display:"flex",justifyContent:"center"}}>
              <SvgGauge value={sensor.humidity} min={0} max={180} unit="%" color="#4caf50" label="Humidity" size={140} />
            </div>
          </div>
          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:600}}>CO2 Level</span><span style={{color:"#ccc"}}>...</span>
            </div>
            <div style={{display:"flex",justifyContent:"center"}}>
              <SvgGauge value={sensor.co2} min={0} max={2000} unit="ppm" color={sensor.co2>1100?"#f59e0b":"#4caf50"} label="CO2 Level" size={140} />
            </div>
          </div>
          <div className="card" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600}}>Sensor Status & Controls</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#4caf50",animation:"pulse 2s infinite"}} />
                <span style={{fontSize:11,color:"#2e7d32",fontWeight:700}}>READY</span>
              </div>
            </div>
            
            <div style={{fontSize:12,color:"#666",borderBottom:"1px solid #f0f0f0",paddingBottom:8}}>
              4/4 nodes online · MQ135 calibrated
            </div>

            {/* Actuator State */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"4px 0"}}>
              <span style={{fontSize:13,fontWeight:600}}>Fan Actuator:</span>
              <span style={{
                fontSize:12,
                fontWeight:700,
                color: controlStatus?.fanState ? "#1976d2" : "#888",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <span style={{
                  display: "inline-block",
                  animation: controlStatus?.fanState ? "spin 2s linear infinite" : "none",
                  fontSize: 14
                }}>
                  💨
                </span>
                {controlStatus?.fanState ? "ACTIVE" : "OFF"}
              </span>
            </div>

            {/* Manual Override Toggle */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--bg3)",padding:"6px 10px",borderRadius:6}}>
              <span style={{fontSize:12,color:"#555"}}>Manual Override:</span>
              <label style={{position:"relative",display:"inline-block",width:34,height:20,cursor:"pointer"}}>
                <input 
                  type="checkbox" 
                  checked={controlStatus?.manualOverride || false}
                  onChange={(e) => setManualControl(e.target.checked, controlStatus?.fanState || false)}
                  style={{opacity:0,width:0,height:0}} 
                />
                <span style={{
                  position:"absolute",
                  inset:0,
                  borderRadius:20,
                  background: controlStatus?.manualOverride ? "#2e7d32" : "#ccc",
                  transition: "0.2s"
                }}>
                  <span style={{
                    position:"absolute",
                    content:"",
                    height:14,
                    width:14,
                    left: controlStatus?.manualOverride ? 17 : 3,
                    bottom:3,
                    background:"white",
                    borderRadius:"50%",
                    transition: "0.2s"
                  }} />
                </span>
              </label>
            </div>

            {/* Manual Override Action Buttons */}
            <div style={{display:"flex",gap:8,marginTop:2}}>
              <button 
                className="btn btn-primary btn-sm" 
                style={{flex:1,fontSize:11,padding:"4px 8px"}}
                disabled={!controlStatus?.manualOverride}
                onClick={() => setManualControl(true, true)}
              >
                Start Fan
              </button>
              <button 
                className="btn btn-ghost btn-sm" 
                style={{flex:1,fontSize:11,padding:"4px 8px"}}
                disabled={!controlStatus?.manualOverride}
                onClick={() => setManualControl(true, false)}
              >
                Stop Fan
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600}}>AI Disease Diagnostics</span>
            <span style={{color:"#ccc"}}>...</span>
          </div>
          <DiagnosticsImage scanResult={null} />
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-primary" style={{flex:1}} onClick={()=>setPage("diagnostics")}><Camera size={14} /> Capture Frame</button>
            <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setPage("diagnostics")}><Upload size={14} /> Upload Image</button>
          </div>
        </div>
      </div>

      {/* Live Visual Twin */}
      <div className="card" style={{display:"flex", flexDirection:"column", gap:12}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <div className="section-title">Live Rearing Tray Visual Twin</div>
            <div style={{fontSize:12, color:"#888"}}>Real-time 4-zone spatial layout mapping conditions across the rearing tray (synced from Firestore)</div>
          </div>
          <div style={{display:"flex", gap:12, fontSize:11}}>
            <span style={{display:"flex", alignItems:"center", gap:4}}><span style={{width:8, height:8, borderRadius:"50%", background:"#4caf50"}} /> Optimal</span>
            <span style={{display:"flex", alignItems:"center", gap:4}}><span style={{width:8, height:8, borderRadius:"50%", background:"#f59e0b"}} /> Warning</span>
            <span style={{display:"flex", alignItems:"center", gap:4}}><span style={{width:8, height:8, borderRadius:"50%", background:"#ef5350"}} /> Critical</span>
          </div>
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          background: "#122a10",
          padding: 20,
          borderRadius: 12,
          border: "2px solid #2e7d32",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.6)"
        }}>
          {['Zone A', 'Zone B', 'Zone C', 'Zone D'].map((zName) => {
            const zData = (sensor.zones && sensor.zones[zName]) || { temperature: sensor.temperature, humidity: sensor.humidity, co2: sensor.co2 }
            const status = getZoneStatusColor(zData.temperature, zData.humidity, zData.co2, activeBatch?.instarStage)
            
            const colorMap = {
              green: { bg: "rgba(76,175,80,0.12)", border: "#4caf50", text: "#a5d6a7" },
              yellow: { bg: "rgba(245,158,11,0.15)", border: "#f59e0b", text: "#ffe082" },
              red: { bg: "rgba(239,83,80,0.15)", border: "#ef5350", text: "#ffab91" }
            }
            
            const currentColors = colorMap[status] || colorMap.green
            
            return (
              <div key={zName} style={{
                background: currentColors.bg,
                border: `2px solid ${currentColors.border}`,
                borderRadius: 8,
                padding: 16,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "all 0.25s ease",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0,0,0,0.15)"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.025)"; e.currentTarget.style.boxShadow = "0 8px 12px rgba(0,0,0,0.25)" }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)" }}
              >
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <span style={{fontSize:14, fontWeight:700, color:"white"}}>{zName}</span>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: currentColors.border,
                    color: "black",
                    textTransform: "uppercase"
                  }}>
                    {status}
                  </span>
                </div>
                
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginTop: 6,
                  color: "#ccc",
                  background: "rgba(0,0,0,0.35)",
                  padding: "8px 12px",
                  borderRadius: 6
                }}>
                  <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                    <span style={{fontSize:9, color:"#888"}}>TEMP</span>
                    <span style={{fontWeight:700, color: currentColors.text}}>{zData.temperature}°C</span>
                  </div>
                  <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                    <span style={{fontSize:9, color:"#888"}}>HUMIDITY</span>
                    <span style={{fontWeight:700, color: currentColors.text}}>{zData.humidity}%</span>
                  </div>
                  <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                    <span style={{fontSize:9, color:"#888"}}>CO₂</span>
                    <span style={{fontWeight:700, color: currentColors.text}}>{zData.co2} ppm</span>
                  </div>
                </div>
                
                <div style={{display:"flex", gap:6, marginTop:4, opacity: 0.85, justifyContent: "center"}}>
                  {Array.from({length: 4}).map((_, i) => (
                    <span key={i} style={{
                      fontSize: 14,
                      animation: `pulse ${1.5 + i*0.2}s infinite`
                    }}>
                      🐛
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title">Environmental History</div>
        <div className="chart-sub">Last 24 hours</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={HISTORY} margin={{top:5,right:10,left:-20,bottom:0}}>
            <defs>
              <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f57c00" stopOpacity={0.2}/><stop offset="95%" stopColor="#f57c00" stopOpacity={0}/></linearGradient>
              <linearGradient id="hG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4caf50" stopOpacity={0.2}/><stop offset="95%" stopColor="#4caf50" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{fill:"#aaa",fontSize:10}} tickLine={false} interval={5} />
            <YAxis tick={{fill:"#aaa",fontSize:10}} tickLine={false} />
            <Tooltip contentStyle={{background:"white",border:"1px solid #e0e0e0",borderRadius:8,fontSize:12}} />
            <ReferenceLine y={26} stroke="#f57c00" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="temp" stroke="#f57c00" fill="url(#tG)" strokeWidth={2} name="Temp" />
            <Area type="monotone" dataKey="humidity" stroke="#4caf50" fill="url(#hG)" strokeWidth={2} name="Humidity" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">Live Activity Feed</div>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#2e7d32"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#4caf50",animation:"pulse 2s infinite"}} />Live
          </div>
        </div>
        {events.map((ev,i) => (
          <div key={ev.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 0",borderBottom:i<events.length-1?"1px solid #f5f5f5":"none",animation:ev.fresh?"slideInLeft 0.4s ease":"none"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:ev.type==="success"?"#4caf50":ev.type==="warning"?"#f59e0b":"#1976d2",flexShrink:0,marginTop:5}} />
            <div style={{flex:1,fontSize:12.5,color:"#555"}}>{ev.text}</div>
            <div style={{fontSize:11,color:"#aaa",whiteSpace:"nowrap"}}>{ev.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}