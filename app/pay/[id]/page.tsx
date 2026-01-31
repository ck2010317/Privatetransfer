'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import WalletButton from '@/components/WalletButton'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { PublicKey, VersionedTransaction } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Lock, Shield } from 'lucide-react'
import { getSignedSignature, type Signed } from '@/lib/signature'
import '@solana/wallet-adapter-react-ui/styles.css'

// Token configuration
const TOKENS: Record<string, { symbol: string; decimals: number; mint: string | null }> = {
  SOL: { symbol: 'SOL', decimals: 9, mint: null },
  USDC: { symbol: 'USDC', decimals: 6, mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
}

function PaymentForm({ paymentData }: { paymentData: { recipient: string; token: string; amount?: string; label?: string } }) {
  const { connection } = useConnection()
  const { publicKey, signTransaction, signMessage } = useWallet()
  const [amount, setAmount] = useState(paymentData.amount || '')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<string>()
  const [encryptionInitialized, setEncryptionInitialized] = useState(false)
  const [encryptionService, setEncryptionService] = useState<any>(null)

  const token = TOKENS[paymentData.token] || TOKENS.SOL

  const initializeEncryption = useCallback(async () => {
    if (!publicKey || !signMessage) {
      alert('Please connect your wallet first')
      return
    }

    try {
      const signed: Signed = { publicKey, provider: { signMessage } }
      await getSignedSignature(signed)

      const { EncryptionService } = await import('privacycash/utils')
      const encService = new EncryptionService()
      encService.deriveEncryptionKeyFromSignature(signed.signature!)
      setEncryptionService(encService)
      setEncryptionInitialized(true)
      alert('Encryption initialized! Ready to pay.')
    } catch (error) {
      console.error('Error initializing encryption:', error)
      alert(error instanceof Error ? error.message : 'Failed to initialize encryption')
    }
  }, [publicKey, signMessage])

  const handlePayment = useCallback(async () => {
    if (!publicKey || !signTransaction || !encryptionService) {
      alert('Please connect wallet and initialize encryption first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const { WasmFactory } = await import('@lightprotocol/hasher.rs')
      const lightWasm = await WasmFactory.getInstance()
      const parsedAmount = parseFloat(amount)

      if (paymentData.token === 'SOL' || !token.mint) {
        const { deposit, withdraw } = await import('privacycash/utils')
        const lamports = Math.floor(parsedAmount * 1_000_000_000)

        // Deposit
        await deposit({
          lightWasm,
          connection,
          amount_in_lamports: lamports,
          keyBasePath: '/circuit2/transaction2',
          publicKey,
          transactionSigner: async (tx: VersionedTransaction) => await signTransaction(tx),
          storage: localStorage,
          encryptionService,
        })

        // Withdraw to recipient
        const withdrawTxs = await withdraw({
          amount_in_lamports: lamports,
          connection,
          encryptionService,
          keyBasePath: '/circuit2/transaction2',
          publicKey,
          storage: localStorage,
          recipient: new PublicKey(paymentData.recipient),
          lightWasm,
        })

        const hash = Array.isArray(withdrawTxs) ? withdrawTxs[0] : withdrawTxs
        setTxHash(typeof hash === 'string' ? hash : hash.toString())
      } else {
        // SPL Token (USDC)
        const { depositSPL, withdrawSPL } = await import('privacycash/utils')
        const baseUnits = Math.floor(parsedAmount * Math.pow(10, token.decimals))

        await depositSPL({
          lightWasm,
          connection,
          base_units: baseUnits,
          keyBasePath: '/circuit2/transaction2',
          publicKey,
          transactionSigner: async (tx: VersionedTransaction) => await signTransaction(tx),
          storage: localStorage,
          encryptionService,
          mintAddress: token.mint,
        })

        await new Promise(resolve => setTimeout(resolve, 2000))

        const mintPublicKey = new PublicKey(token.mint!)
        const recipientPublicKey = new PublicKey(paymentData.recipient)

        const withdrawTxs = await withdrawSPL({
          connection,
          encryptionService,
          keyBasePath: '/circuit2/transaction2',
          publicKey,
          storage: localStorage,
          recipient: recipientPublicKey,
          lightWasm,
          mintAddress: mintPublicKey,
          base_units: baseUnits,
        })

        const hash = Array.isArray(withdrawTxs) ? withdrawTxs[0] : withdrawTxs
        setTxHash(typeof hash === 'string' ? hash : hash.toString())
      }

      setLoading(false)
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err?.message || 'Payment failed')
      setLoading(false)
    }
  }, [publicKey, signTransaction, connection, encryptionService, amount, paymentData, token])

  return (
    <div className="space-y-6">
      {paymentData.label && (
        <div className="text-center">
          <p className="text-slate-400 text-sm">Paying to</p>
          <p className="text-xl font-bold text-white">{paymentData.label}</p>
        </div>
      )}

      <div className="bg-purple-900/20 border border-purple-800/40 rounded-xl p-4">
        <div className="flex items-center gap-2 text-purple-300">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">Private Payment</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Your payment will be processed privately. The recipient's wallet address is hidden.
        </p>
      </div>

      <div>
        <label className="text-base font-semibold text-slate-100 block mb-2">
          Amount ({token.symbol})
        </label>
        <Input
          type="number"
          placeholder="0.5"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-black/40 border border-purple-800/40 focus:border-purple-500 text-white rounded-xl"
          disabled={loading || !!paymentData.amount}
          step="0.01"
          min="0"
        />
        {paymentData.amount && (
          <p className="text-xs text-slate-400 mt-1">Amount is fixed by the payment link</p>
        )}
      </div>

      {!encryptionInitialized && (
        <Alert className="bg-black/60 border border-purple-900/40">
          <AlertCircle className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-200">
            Initialize encryption first by signing a message with your wallet.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-black/60 border border-red-900/40">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {txHash && (
        <Alert className="bg-black/60 border border-green-900/40">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            Payment successful! 🎉
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={initializeEncryption}
          variant="outline"
          disabled={loading || encryptionInitialized || !publicKey}
          className="flex-1 bg-gradient-to-r from-purple-800 via-blue-900 to-fuchsia-900 text-white border-none"
        >
          {encryptionInitialized ? 'Ready ✓' : 'Initialize'}
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading || !publicKey || !encryptionInitialized}
          className="flex-1 bg-gradient-to-r from-purple-700 via-blue-800 to-fuchsia-800 text-white font-bold border-none"
        >
          {loading ? 'Processing...' : `Pay ${amount || '0'} ${token.symbol}`}
        </Button>
      </div>
    </div>
  )
}

const PayPageContent = dynamic(
  () => Promise.resolve(function PayPageContentComponent() {
    const params = useParams()
    const [paymentData, setPaymentData] = useState<{ recipient: string; token: string; amount?: string; label?: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchPaymentData = async () => {
        const id = params?.id as string
        console.log('[PayPage] ID from params:', id)
        if (!id) {
          setLoading(false)
          return
        }
        
        try {
          const response = await fetch(`/api/paylink?id=${id}`)
          if (response.ok) {
            const data = await response.json()
            console.log('[PayPage] Fetched payment data:', data)
            setPaymentData(data)
          } else {
            console.log('[PayPage] Payment link not found or expired')
            setPaymentData(null)
          }
        } catch (error) {
          console.error('[PayPage] Error fetching payment data:', error)
          setPaymentData(null)
        }
        setLoading(false)
      }
      
      fetchPaymentData()
    }, [params])

    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      )
    }

    if (!paymentData) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Payment Link</h1>
            <p className="text-slate-400">This payment link is invalid or has expired.</p>
            <p className="text-xs text-slate-500 mt-4">ID: {params?.id as string}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-black">
        <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PrivatePay
              </h1>
              <p className="text-xs text-slate-400">Private Payment</p>
            </div>
            <WalletButton />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="relative p-6 rounded-2xl shadow-2xl bg-black/70 backdrop-blur-xl border border-neutral-800">
            <div className="absolute -inset-1 rounded-2xl pointer-events-none bg-gradient-to-tr from-purple-900/40 via-blue-900/30 to-fuchsia-900/40 opacity-40 blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
                Complete Payment
              </h2>
              <PaymentForm paymentData={paymentData} />
            </div>
          </div>
        </main>
      </div>
    )
  }),
  { ssr: false }
)

export default function PayPage() {
  const endpoint = 'https://mainnet.helius-rpc.com/?api-key=59f7f4c5-24e2-4ecd-a46e-9bcccda806d6'
  const wallets = React.useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <PayPageContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
