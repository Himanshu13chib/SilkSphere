import React from 'react'
import BuyerMarketplace from './BuyerMarketplace'
import MyOrders from './MyOrders'
import Wallet from '../shared/Wallet'
import Settings from '../shared/Settings'

export default function BuyerRouter({ page, setPage }) {
  switch (page) {
    case 'marketplace': return <BuyerMarketplace />
    case 'orders': return <MyOrders />
    case 'wallet': return <Wallet />
    case 'settings': return <Settings />
    default: return <BuyerMarketplace />
  }
}
