import React from 'react'
import { useApp } from '../../context/AppContext'

export default function MyOrders() {
  const { orders } = useApp()
  const myOrders = orders
  const confirmed = myOrders.filter(o => o.status === 'confirmed').length
  const pending = myOrders.filter(o => o.status === 'pending').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="grid-3">
        {[['Total Orders', myOrders.length, 'var(--accent)', '📦'], ['Confirmed', confirmed, 'var(--green)', '✅'], ['Pending', pending, 'var(--orange)', '⏳']].map(([label, val, color, icon], i) => (
          <div key={label} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><div className="stat-label">{label}</div><span style={{ fontSize: 20 }}>{icon}</span></div>
            <div className="stat-value" style={{ color }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Order History</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Batch ID</th><th>Farmer</th><th>Quantity</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {myOrders.map(o => (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td className="mono">{o.batchId}</td>
                  <td>{o.farmer}</td>
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
