'use client';

import React, { useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, CheckCircle2, AlertCircle } from 'lucide-react'
import { useSelectedToken } from '@/context/TokenContext'
import { getAccount, getMint } from '@solana/spl-token'

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

export default function WalletInfo() {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const { selectedToken } = useSelectedToken()
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return

      setLoading(true)
      try {
        if (selectedToken === 'SOL') {
          // Fetch SOL balance
          const bal = await connection.getBalance(publicKey)
          setBalance(bal / LAMPORTS_PER_SOL)
        } else if (selectedToken === 'USDC') {
          // Fetch all token accounts for this wallet
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: USDC_MINT,
          })

          if (tokenAccounts.value.length > 0) {
            const usdcAccount = tokenAccounts.value[0]
            const amount = usdcAccount.account.data.parsed.info.tokenAmount.uiAmount || 0
            setBalance(amount)
          } else {
            setBalance(0)
          }
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
        setBalance(0)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 5000)
    return () => clearInterval(interval)
  }, [publicKey, connection, selectedToken])

  if (!connected) {
    return (
      <Card className="bg-black/70 border border-neutral-800 backdrop-blur-xl shadow-2xl p-6 flex flex-col items-center justify-center min-h-[180px]">
        <div className="flex flex-col items-center gap-3 w-full">
          <Wallet className="w-8 h-8 text-purple-500 mb-1 drop-shadow-lg" />
          <p className="text-sm font-semibold text-slate-300 text-center">Connect your wallet to see balance</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-black/70 border border-neutral-800 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-purple-300">Wallet Status</CardTitle>
          <Badge
            variant="outline"
            className="bg-green-900/30 text-green-300 border-green-700/50"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Wallet Address</p>
          <p className="text-xs font-mono text-slate-200 truncate">{publicKey?.toBase58()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">{selectedToken} Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
              {loading ? '...' : balance.toFixed(selectedToken === 'SOL' ? 4 : 2)}
            </span>
            <span className="text-sm text-slate-400">{selectedToken}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
