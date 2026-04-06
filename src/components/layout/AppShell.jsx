import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import FarmerRouter from '../../pages/farmer/FarmerRouter'
import BuyerRouter from '../../pages/buyer/BuyerRouter'

export default function AppShell() {
  const { user } = useApp()
  const [page, setPage] = useState(user?.role === 'farmer' ? 'dashboard' : 'marketplace')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content">
        <Topbar page={page} setPage={setPage} setSidebarOpen={setSidebarOpen} />
        <div className="page-content">
          {user?.role === 'farmer'
            ? <FarmerRouter page={page} setPage={setPage} />
            : <BuyerRouter page={page} setPage={setPage} />
          }
        </div>
      </div>
    </div>
  )
}
