import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import AuthRouter from './pages/auth/AuthRouter'
import AppShell from './components/layout/AppShell'
import ToastContainer from './components/ui/ToastContainer'
import KiroOrb from './components/ui/KiroOrb'

function Inner() {
  const { user } = useApp()
  return (
    <>
      {user ? <AppShell /> : <AuthRouter />}
      <ToastContainer />
      {user && <KiroOrb />}
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
