import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { Bell, Menu, ChevronRight, Wallet } from 'lucide-react'

const PAGE_LABELS = {
  dashboard: 'Dashboard', lifecycle: 'Life Cycle', batches: 'My Batches',
  diagnostics: 'AI Diagnostics', analytics: 'Analytics',
  marketplace: 'Marketplace', wallet: 'Wallet', settings: 'Settings', orders: 'My Orders',
}

export default function Topbar({ page, setPage, setSidebarOpen }) {
  const { user, alerts, markAlertsRead, wallet } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const unread = alerts.filter(a => !a.read).length

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openNotif = () => { setNotifOpen(p => !p); if (!notifOpen) markAlertsRead() }

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={() => setSidebarOpen(p => !p)}><Menu size={20} /></button>
      <div className="topbar-breadcrumb">
        <span style={{ color: 'var(--text3)', fontSize: 13 }}>SilkSphere</span>
        <ChevronRight size={14} style={{ color: 'var(--text3)' }} />
        <span>{PAGE_LABELS[page] || page}</span>
      </div>
      <div className="topbar-actions">
        <div className="wallet-chip" onClick={() => setPage('wallet')}>
          <Wallet size={14} style={{ color: 'var(--gold)' }} />
          <span className="amount">₹{wallet.balance.toLocaleString('en-IN')}</span>
        </div>

        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="notif-btn" onClick={openNotif}>
            <Bell size={16} />
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span>Notifications</span>
                <span style={{ color: 'var(--text3)', fontSize: 11 }}>{alerts.length} alerts</span>
              </div>
              {alerts.map(a => (
                <div key={a.id} className="notif-item">
                  <div className={`notif-dot ${a.type}`} />
                  <div>
                    <div className="notif-msg">{a.message}</div>
                    <div className="notif-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="user-chip">
          <div className="user-chip-avatar">{(user?.name || 'U')[0].toUpperCase()}</div>
          <span className="user-chip-name">{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  )
}
