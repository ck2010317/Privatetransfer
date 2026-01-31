'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function WalletButton() {
  const { publicKey, wallet, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClick = () => {
    if (publicKey) {
      setShowDropdown(!showDropdown)
    } else {
      setVisible(true)
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
    setShowDropdown(false)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}..${address.slice(-4)}`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={handleClick}
        disabled={connecting}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2"
      >
        {wallet?.adapter.icon && (
          <img 
            src={wallet.adapter.icon} 
            alt={wallet.adapter.name} 
            className="w-5 h-5"
          />
        )}
        {connecting ? (
          'Connecting...'
        ) : publicKey ? (
          truncateAddress(publicKey.toBase58())
        ) : (
          'Select Wallet'
        )}
      </Button>

      {showDropdown && publicKey && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-3 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
