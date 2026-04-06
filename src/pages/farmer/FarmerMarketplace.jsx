import React from 'react'
import { useApp } from '../../context/AppContext'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export default function FarmerMarketplace() {
  const { batches, orders } = useApp()
  const listed = batches.filter(b => b.status === 'listed')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="section-header"><div className="section-title">Listed Batches</div></div>
        <div className="grid-auto">
          {listed.map(b => (
            <div key={b.id} className="card" style={{ border: b.grade === 'A' ? '1px solid rgba(245,200,66,0.3)' : '1px solid var(--border)', boxShadow: b.grade === 'A' ? 'var(--glow-gold)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className={`badge badge-${b.grade}`}>Grade {b.grade}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>₹{b.price?.toLocaleString('en-IN')}/kg</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{b.id}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{b.instarStage} · {b.quantity} kg</div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                  <span>Env Score</span><span>{b.envScore}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill green" style={{ width: `${b.envScore}%` }} /></div>
              </div>
              <div style={{ height: 40 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={b.vitality.map((v, i) => ({ i, v }))}>
                    <Line type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', marginTop: 2 }}>7-day vitality trend</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Incoming Purchase Orders</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Batch ID</th><th>Quantity</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td className="mono">{o.batchId}</td>
                  <td>{o.quantity} kg</td>
                  <td style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{o.amount.toLocaleString('en-IN')}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--text3)' }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
