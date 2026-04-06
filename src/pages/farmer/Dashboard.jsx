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
          PRELIMINARY (TF.js): {scanResult} (98%)
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

export default function Dashboard({ setPage }) {
  const { sensor, batches } = useApp()
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

      {activeBatch && (
        <div style={{background:"white",border:"1px solid #e0e0e0",borderRadius:12,padding:"16px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:18,fontWeight:700}}>Batch Overview: {activeBatch.id} (Active - {activeBatch.instarStage})</div>
          <div style={{display:"flex",gap:20,marginTop:8,flexWrap:"wrap"}}>
            <span style={{fontSize:13,color:"#555"}}>Env Score: <strong style={{color:"#2e7d32"}}>{activeBatch.envScore}%</strong></span>
            <span style={{fontSize:13,color:"#555"}}>AI Health: <strong style={{color:"#2e7d32"}}>{activeBatch.aiScore}%</strong></span>
            <span style={{fontSize:13,color:"#555"}}>Grade: <span className={"badge badge-"+(activeBatch.grade||"B")}>Grade {activeBatch.grade||"?"}</span></span>
            <span style={{fontSize:13,color:"#555"}}>Qty: <strong>{activeBatch.quantity} kg</strong></span>
          </div>
        </div>
      )}

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
          <div className="card" style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:13,fontWeight:600}}>Sensor Status</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#4caf50",animation:"pulse 2s infinite"}} />
              <span style={{fontSize:15,fontWeight:700,color:"#2e7d32",letterSpacing:"1px"}}>READY</span>
            </div>
            <div style={{fontSize:12,color:"#555",lineHeight:1.6}}>MQ135 calibration complete (is_calibrating = false)</div>
            <div style={{fontSize:11,color:"#888"}}>4/4 nodes online</div>
          </div>
        </div>

        <div className="card" style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600}}>AI Disease Diagnostics</span>
            <span style={{color:"#ccc"}}>...</span>
          </div>
          <DiagnosticsImage scanResult="Healthy" />
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-primary" style={{flex:1}} onClick={()=>setPage("diagnostics")}><Camera size={14} /> Capture Frame</button>
            <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setPage("diagnostics")}><Upload size={14} /> Upload Image</button>
          </div>
          <div style={{fontSize:11,color:"#888",textAlign:"center"}}>Note: Authoritative Flask result will update after capture.</div>
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