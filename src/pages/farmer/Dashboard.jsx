import React, { useState, useEffect } from "react"
import { useApp } from "../../context/AppContext"
import { CheckCircle, Bell, Calendar, ChevronRight, Thermometer, Droplets, Wind, AlertTriangle, Brain } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

const makeSpark = (base, amp, len = 30) =>
  Array.from({ length: len }, (_, i) => ({
    v: +(base + amp * Math.sin(i / 3) + (Math.random() - 0.5) * amp * 0.5).toFixed(1),
  }))
const TEMP_SPARK = makeSpark(24, 1.2)
const HUMI_SPARK = makeSpark(78, 3)
const CO2_SPARK  = makeSpark(1066, 60)

function useCountdown(target) {
  const [remaining, setRemaining] = useState(target)
  useEffect(() => {
    const t = setInterval(() => setRemaining(p => (p <= 0 ? target : p - 1)), 1000)
    return () => clearInterval(t)
  }, [target])
  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")
}

function RingProgress({ percent = 60, size = 72, stroke = 7 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(percent,100) / 100) * circ
  return (
    <svg width={size} height={size} style={{ flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#16a34a" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="42%" textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={700} fill="#0f172a">{percent}%</text>
      <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fontSize={6} fill="#94a3b8">Progress to</text>
      <text x="50%" y="74%" textAnchor="middle" dominantBaseline="middle" fontSize={6} fill="#94a3b8">Next Instar</text>
    </svg>
  )
}

function EnvCard({ icon: Icon, iconBg, iconColor, label, value, unit, sub, sparkData, sparkColor, valueColor, gradientId }) {
  return (
    <div style={{ background:"white", borderRadius:10, border:"1px solid #e2e8f0", padding:"12px 14px 10px", display:"flex", flexDirection:"column", gap:4, flex:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:28, height:28, borderRadius:7, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Icon size={14} color={iconColor} />
        </div>
        <span style={{ fontSize:11.5, color:"#64748b", fontWeight:500 }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
        <span style={{ fontSize:26, fontWeight:700, color: valueColor||"#0f172a", lineHeight:1 }}>{value}</span>
        <span style={{ fontSize:12, color:"#64748b" }}>{unit}</span>
      </div>
      <div style={{ fontSize:10.5, color:"#94a3b8" }}>{sub}</div>
      <ResponsiveContainer width="100%" height={34}>
        <AreaChart data={sparkData} margin={{ top:1, right:0, left:0, bottom:0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sparkColor} stopOpacity={0.2}/>
              <stop offset="100%" stopColor={sparkColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={sparkColor} fill={`url(#${gradientId})`} strokeWidth={1.6} dot={false}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// SVG icons matching the reference image
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#ca8a04" fillOpacity="0.8"/>
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const BagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="6" x2="21" y2="6" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M16 10a4 4 0 01-8 0" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Dashboard({ setPage }) {
  const { sensor, batches, predictions, controlStatus, setManualControl } = useApp()
  const activeBatch = batches.find(b => b.status==="active") || batches[0]
  const hasAlert = sensor.co2 > 1100 || sensor.temperature > 27.5

  const aiScore  = activeBatch?.aiScore  || 100
  const envScore = activeBatch?.envScore || 79
  const grade    = predictions?.expected_cocoon_grade || activeBatch?.grade || "B"
  const qty      = activeBatch?.quantity || 52

  const feedingTime  = useCountdown(7200)
  const cleaningTime = useCountdown(19200)
  const harvestTime  = useCountdown(176400)

  const now = new Date()
  const dateStr = now.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
  const timeStr = now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})

  const LIFECYCLE = ["Instar 1","Instar 2","Instar 3","Instar 4","Instar 5"]
  const currentIdx = LIFECYCLE.indexOf(activeBatch?.instarStage || "Instar 3")

  const card = { background:"white", borderRadius:10, border:"1px solid #e2e8f0", boxShadow:"0 1px 2px rgba(0,0,0,0.04)" }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, fontFamily:"Inter,sans-serif", color:"#0f172a" }}>

      {/* Row 1: Header */}
      <div style={{ ...card, padding:"12px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:"#64748b", marginBottom:3 }}>Batch Overview</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <span style={{ fontSize:22, fontWeight:800, color:"#0f172a", letterSpacing:"-0.4px" }}>{activeBatch?.id||"SS-2026-0061"}</span>
            <span style={{ background:"#dcfce7", color:"#16a34a", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, border:"1px solid #bbf7d0" }}>Active</span>
          </div>
          <div style={{ fontSize:11, color:"#94a3b8", display:"flex", gap:5 }}>
            <span>{activeBatch?.instarStage||"Instar 3"}</span><span>•</span>
            <span>{qty} kg</span><span>•</span><span>Started on 18 Aug 2026</span>
          </div>
        </div>
        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:9, padding:"10px 16px", display:"flex", flexDirection:"column", gap:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:20,height:20,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <CheckCircle size={11} color="white" fill="white"/>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:"#16a34a" }}>System Healthy</span>
          </div>
          <div style={{ fontSize:11, color:"#64748b", paddingLeft:26 }}>4/4 sensors online&nbsp;•&nbsp;No active alerts</div>
          <div style={{ fontSize:11, color:"#16a34a", fontWeight:600, paddingLeft:26 }}>Auto-control: {controlStatus?.manualOverride?"OFF":"ON"}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative", cursor:"pointer" }}>
            <div style={{ width:32,height:32,borderRadius:7,background:"#f1f5f9",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Bell size={14} color="#64748b"/>
            </div>
            {hasAlert && <span style={{ position:"absolute",top:-3,right:-3,background:"#ef4444",color:"white",fontSize:8,fontWeight:800,borderRadius:"50%",width:13,height:13,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid white" }}>2</span>}
          </div>
          <div style={{ width:32,height:32,borderRadius:7,background:"#f1f5f9",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Calendar size={14} color="#64748b"/>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11.5, fontWeight:600, color:"#0f172a" }}>{dateStr}</div>
            <div style={{ fontSize:10.5, color:"#94a3b8" }}>{timeStr}</div>
          </div>
        </div>
      </div>

      {/* Row 2: KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {/* AI Health */}
        <div style={{ ...card, padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
            <div style={{ width:27,height:27,borderRadius:7,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Brain size={13} color="#16a34a"/>
            </div>
            <span style={{ fontSize:11, color:"#64748b" }}>AI Health</span>
          </div>
          <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{aiScore}%</div>
          <div style={{ fontSize:11, color:"#16a34a", fontWeight:600, marginTop:2 }}>Excellent</div>
        </div>
        {/* Env Score */}
        <div style={{ ...card, padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
            <div style={{ width:27,height:27,borderRadius:7,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <span style={{ fontSize:13 }}>🌿</span>
            </div>
            <span style={{ fontSize:11, color:"#64748b" }}>Environment Score</span>
          </div>
          <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{envScore}%</div>
          <div style={{ fontSize:11, color:"#16a34a", fontWeight:600, marginTop:2 }}>Good</div>
        </div>
        {/* Cocoon Grade */}
        <div style={{ ...card, padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
            <div style={{ width:27,height:27,borderRadius:7,background:"#fef9c3",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <ShieldIcon/>
            </div>
            <span style={{ fontSize:11, color:"#64748b" }}>Cocoon Grade (Predicted)</span>
          </div>
          <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{grade}</div>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>Current Grade</div>
        </div>
        {/* Total Qty */}
        <div style={{ ...card, padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
            <div style={{ width:27,height:27,borderRadius:7,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <BagIcon/>
            </div>
            <span style={{ fontSize:11, color:"#64748b" }}>Total Quantity</span>
          </div>
          <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{qty} kg</div>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>Expected Yield: {qty}–{qty+8} kg</div>
        </div>
      </div>

      {/* Row 3: Live Environment */}
      <div style={{ ...card, padding:"12px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Live Environment</span>
            <span style={{ fontSize:11, color:"#94a3b8" }}>(Real-time)</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:20, padding:"2px 8px" }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#16a34a" }}/>
            <span style={{ fontSize:10.5, color:"#16a34a", fontWeight:600 }}>Live</span>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          <EnvCard icon={Thermometer} iconBg="#dcfce7" iconColor="#16a34a"
            label="Temperature" value={sensor.temperature} unit="°C"
            sub="Optimal Range: 22 – 26°C"
            sparkData={TEMP_SPARK} sparkColor="#16a34a" valueColor="#0f172a"
            gradientId="grad-temp"/>
          <EnvCard icon={Droplets} iconBg="#dbeafe" iconColor="#2563eb"
            label="Humidity" value={sensor.humidity} unit="%"
            sub="Optimal Range: 70 – 85%"
            sparkData={HUMI_SPARK} sparkColor="#2563eb" valueColor="#0f172a"
            gradientId="grad-humi"/>
          <EnvCard icon={Wind} iconBg="#f3e8ff" iconColor="#9333ea"
            label="CO₂ Level" value={sensor.co2} unit="ppm"
            sub="Optimal Range: 800 – 1500 ppm"
            sparkData={CO2_SPARK} sparkColor="#9333ea" valueColor="#9333ea"
            gradientId="grad-co2"/>
        </div>
      </div>

      {/* Row 4: Health + Actions + Progress */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>

        {/* Batch Health */}
        <div style={{ ...card, padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Brain size={13} color="#16a34a"/>
            <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>Batch Health Summary</span>
          </div>
          <div>
            <div style={{ fontSize:30, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{aiScore}%</div>
            <div style={{ fontSize:11.5, color:"#16a34a", fontWeight:600, marginTop:2 }}>Excellent</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {[["Disease Status","No critical disease detected"],["Environment","Good"],["Growth Progress","On track"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#475569" }}>
                  <CheckCircle size={11} color="#16a34a"/>{k}
                </span>
                <span style={{ fontSize:11, color:"#94a3b8" }}>{v}</span>
              </div>
            ))}
          </div>
          {/* Fan controls */}
          <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:8, display:"flex", flexDirection:"column", gap:7 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#64748b" }}>Fan: <strong style={{ color:controlStatus?.fanState?"#16a34a":"#94a3b8" }}>{controlStatus?.fanState?"ON":"OFF"}</strong></span>
              <label style={{ position:"relative", display:"inline-block", width:34, height:18, cursor:"pointer" }}>
                <input type="checkbox" checked={controlStatus?.manualOverride||false}
                  onChange={(e)=>setManualControl(e.target.checked,controlStatus?.fanState||false)}
                  style={{ opacity:0, width:0, height:0 }}/>
                <span style={{ position:"absolute", inset:0, borderRadius:18, background:controlStatus?.manualOverride?"#16a34a":"#cbd5e1", transition:"0.2s" }}>
                  <span style={{ position:"absolute", height:12, width:12, left:controlStatus?.manualOverride?18:3, bottom:3, background:"white", borderRadius:"50%", transition:"0.2s" }}/>
                </span>
              </label>
            </div>
            <div style={{ display:"flex", gap:5 }}>
              <button style={{ flex:1, padding:"4px 6px", borderRadius:5, fontSize:10.5, fontWeight:600, border:"1px solid #16a34a", background:"#16a34a", color:"white", cursor:"pointer", opacity:controlStatus?.manualOverride?1:0.4 }}
                disabled={!controlStatus?.manualOverride} onClick={()=>setManualControl(true,true)}>Start Fan</button>
              <button style={{ flex:1, padding:"4px 6px", borderRadius:5, fontSize:10.5, fontWeight:600, border:"1px solid #e2e8f0", background:"white", color:"#475569", cursor:"pointer", opacity:controlStatus?.manualOverride?1:0.4 }}
                disabled={!controlStatus?.manualOverride} onClick={()=>setManualControl(true,false)}>Stop Fan</button>
            </div>
          </div>
          <button onClick={()=>setPage("diagnostics")}
            style={{ width:"100%", padding:"7px", borderRadius:7, fontSize:11, fontWeight:600, border:"1px solid #e2e8f0", background:"#f8fafc", color:"#475569", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginTop:"auto" }}>
            View AI Diagnostics <ChevronRight size={11}/>
          </button>
        </div>

        {/* Upcoming Actions */}
        <div style={{ ...card, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Calendar size={13} color="#2563eb"/>
            <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>Upcoming Actions</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              {icon:"✏️", label:"Next Feeding", sub:"Instar 3 – 5th Feeding", time:feedingTime, color:"#16a34a"},
              {icon:"🧹", label:"Cleaning", sub:"Remove waste & old leaves", time:cleaningTime, color:"#2563eb"},
              {icon:"🫘", label:"Harvest (Est.)", sub:"Expected cocoon harvest", time:harvestTime, color:"#f59e0b"},
            ].map(({icon,label,sub,time,color})=>(
              <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:16 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:11.5, fontWeight:600, color:"#0f172a" }}>{label}</div>
                    <div style={{ fontSize:10.5, color:"#94a3b8" }}>{sub}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:12, fontWeight:700, color, fontFamily:"monospace" }}>{time}</div>
                  <div style={{ fontSize:9.5, color:"#94a3b8" }}>Remaining</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>setPage("lifecycle")}
            style={{ width:"100%", padding:"7px", borderRadius:7, fontSize:11, fontWeight:600, border:"1px solid #e2e8f0", background:"#f8fafc", color:"#475569", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginTop:"auto" }}>
            View Full Schedule <ChevronRight size={11}/>
          </button>
        </div>

        {/* Batch Progress */}
        <div style={{ ...card, padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:13 }}>📈</span>
            <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>Batch Progress</span>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
              {LIFECYCLE.map((stage,idx)=>{
                const done = idx < currentIdx
                const current = idx === currentIdx
                return (
                  <div key={stage} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:14,height:14,borderRadius:"50%",flexShrink:0,
                        background:done?"#16a34a":current?"#16a34a":"white",
                        border:`2px solid ${done||current?"#16a34a":"#cbd5e1"}`,
                        display:"flex",alignItems:"center",justifyContent:"center" }}>
                        {done && <span style={{ color:"white", fontSize:8, fontWeight:900 }}>✓</span>}
                        {current && <div style={{ width:5,height:5,borderRadius:"50%",background:"white" }}/>}
                      </div>
                      <span style={{ fontSize:11.5, fontWeight:current?700:500, color:current?"#0f172a":"#94a3b8" }}>{stage}</span>
                    </div>
                    <span style={{ fontSize:10, color:done?"#16a34a":current?"#2563eb":"#cbd5e1", fontWeight:500 }}>
                      {done?"Completed":current?"Current Stage":"Upcoming"}
                    </span>
                  </div>
                )
              })}
            </div>
            <RingProgress percent={predictions?.predicted_progress_24h||60}/>
          </div>
          <button onClick={()=>setPage("lifecycle")}
            style={{ width:"100%", padding:"7px", borderRadius:7, fontSize:11, fontWeight:600, border:"1px solid #e2e8f0", background:"#f8fafc", color:"#475569", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginTop:"auto" }}>
            View Life Cycle <ChevronRight size={11}/>
          </button>
        </div>
      </div>

      {/* Row 5: Alerts */}
      <div style={{ ...card, padding:"10px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28,height:28,borderRadius:"50%",background:"#f1f5f9",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Bell size={12} color="#64748b"/>
          </div>
          <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>Alerts &amp; Notifications</span>
        </div>
        {hasAlert ? (
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <AlertTriangle size={13} color="#f59e0b"/>
            <span style={{ fontSize:11.5, color:"#f59e0b", fontWeight:600 }}>
              {sensor.co2>1100?`CO₂ at ${sensor.co2} ppm exceeds threshold`:`Temperature at ${sensor.temperature}°C above normal`}
            </span>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:12, color:"#16a34a", fontWeight:600 }}>No active alerts</span>
            <span style={{ fontSize:11, color:"#94a3b8" }}>You will be notified when any parameter goes out of range.</span>
          </div>
        )}
        <button style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:11.5, color:"#16a34a", fontWeight:600 }}>
          View All Alerts <ChevronRight size={12} color="#16a34a"/>
        </button>
      </div>

    </div>
  )
}
