import React, { useState } from 'react'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

export default function AuthRouter() {
  const [page, setPage] = useState('login')
  if (page === 'register') return <RegisterPage onLogin={() => setPage('login')} />
  return <LoginPage onRegister={() => setPage('register')} />
}
