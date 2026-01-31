'use client'

import React, { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Copy, Link, Share2, Shield } from 'lucide-react'
import { useSelectedToken } from '@/context/TokenContext'

// Token configuration
const TOKENS = {
  SOL: { symbol: 'SOL', decimals: 9 },
  USDC: { symbol: 'USDC', decimals: 6 },
}

export default function CreatePaymentLink() {
  const { publicKey } = useWallet()
  const { selectedToken, setSelectedToken } = useSelectedToken()
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [generatedLink, setGeneratedLink] = useState<string>()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const generateLink = useCallback(async () => {
    if (!publicKey) {
      alert('Please connect your wallet first')
      return
    }

    setLoading(true)
    try {
      // Call API to store payment data securely
      const response = await fetch('/api/paylink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: publicKey.toBase58(),
          token: selectedToken,
          amount: amount || null,
          label: label || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment link')
      }

      const { id } = await response.json()
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const link = `${baseUrl}/pay/${id}`
      setGeneratedLink(link)
      setCopied(false)
    } catch (error) {
      console.error('Error generating link:', error)
      alert('Failed to generate payment link')
    } finally {
      setLoading(false)
    }
  }, [publicKey, selectedToken, amount, label])

  const copyLink = useCallback(() => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [generatedLink])

  const shareLink = useCallback(async () => {
    if (generatedLink && navigator.share) {
      try {
        await navigator.share({
          title: 'Pay me privately',
          text: label ? `Pay ${label}` : 'Send me a private payment',
          url: generatedLink,
        })
      } catch {
        copyLink()
      }
    } else {
      copyLink()
    }
  }, [generatedLink, label, copyLink])

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/30 border border-purple-800/40">
          <Link className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">Create Payment Link</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Share this link to receive payments privately. Your wallet address stays hidden.
        </p>
      </div>

      {!publicKey && (
        <Alert className="bg-black/60 border border-yellow-900/40">
          <AlertDescription className="text-yellow-200">
            Connect your wallet to create a payment link
          </AlertDescription>
        </Alert>
      )}

      <div>
        <label className="text-sm font-semibold text-slate-100 block mb-2">Token</label>
        <div className="flex gap-2">
          {Object.entries(TOKENS).map(([key]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedToken(key as 'SOL' | 'USDC')}
              className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all duration-200 ${
                selectedToken === key
                  ? 'bg-gradient-to-r from-purple-700 to-blue-700 text-white border border-purple-500'
                  : 'bg-black/40 text-purple-300 border border-purple-800/40 hover:bg-purple-900/30'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-100 block mb-2">
          Amount ({selectedToken}) <span className="text-slate-400 font-normal">- optional</span>
        </label>
        <Input
          type="number"
          placeholder="Leave empty for any amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-black/40 border border-purple-800/40 focus:border-purple-500 text-white rounded-xl"
          step="0.01"
          min="0"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-100 block mb-2">
          Label <span className="text-slate-400 font-normal">- optional</span>
        </label>
        <Input
          type="text"
          placeholder="e.g., Coffee payment, Invoice #123"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="bg-black/40 border border-purple-800/40 focus:border-purple-500 text-white rounded-xl"
          maxLength={50}
        />
      </div>

      <Button
        onClick={generateLink}
        disabled={!publicKey || loading}
        className="w-full bg-gradient-to-r from-purple-700 via-blue-800 to-fuchsia-800 text-white font-bold border-none hover:brightness-110"
      >
        <Link className="h-4 w-4 mr-2" />
        {loading ? 'Creating...' : 'Generate Payment Link'}
      </Button>

      {generatedLink && (
        <div className="space-y-3">
          <Alert className="bg-black/60 border border-green-900/40">
            <Shield className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              Private payment link created! Your wallet address is hidden.
            </AlertDescription>
          </Alert>

          <div className="bg-black/40 border border-purple-800/40 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-2">Your payment link:</p>
            <p className="text-xs text-purple-300 break-all font-mono">{generatedLink}</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={copyLink}
              variant="outline"
              className="flex-1 bg-black/40 border-purple-800/40 text-purple-300 hover:bg-purple-900/30"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              onClick={shareLink}
              className="flex-1 bg-gradient-to-r from-purple-700 to-blue-700 text-white border-none"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
