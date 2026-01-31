'use client'

import React, { useState, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2, Lock, Unlock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getSignedSignature, type Signed } from '@/lib/signature'
import { useSelectedToken } from '@/context/TokenContext'

// Token configuration
const TOKENS = {
  SOL: {
    symbol: 'SOL',
    decimals: 9,
    mint: null,
  },
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
}

interface TransferState {
  amount: string
  recipient: string
  loading: boolean
  txHash?: string
  error?: string
  token: keyof typeof TOKENS
}

export default function PrivateTransferForm() {
  const { connection } = useConnection()
  const { publicKey, signTransaction, signMessage } = useWallet()
  const { selectedToken, setSelectedToken } = useSelectedToken()
  const [transferState, setTransferState] = useState<TransferState>({
    amount: '',
    recipient: '',
    loading: false,
    token: 'SOL',
  })
  const [recipients, setRecipients] = useState<string[]>([''])
  const [encryptionInitialized, setEncryptionInitialized] = useState(false)
  const [encryptionService, setEncryptionService] = useState<any>(null)

  // Initialize encryption from wallet signature
  const initializeEncryption = useCallback(async () => {
    if (!publicKey || !signMessage) {
      alert('Please connect your wallet first')
      return
    }

    try {
      console.log('Initializing encryption service...')

      const signed: Signed = {
        publicKey,
        provider: { signMessage },
      }

      await getSignedSignature(signed)

      // Dynamically import EncryptionService
      const { EncryptionService } = await import('privacycash/utils')
      const encService = new EncryptionService()
      encService.deriveEncryptionKeyFromSignature(signed.signature!)
      setEncryptionService(encService)
      setEncryptionInitialized(true)

      console.log('Encryption service initialized')
      alert('Encryption initialized! Ready to deposit/withdraw.')
    } catch (error) {
      console.error('Error initializing encryption:', error)
      alert(error instanceof Error ? error.message : 'Failed to initialize encryption')
    }
  }, [publicKey, signMessage])

  // Handle combined deposit and withdrawal
  const handleTransfer = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      alert('Please connect your wallet first')
      return
    }

    if (!transferState.amount || parseFloat(transferState.amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (!recipients.length || recipients.some(r => !r)) {
      alert('Please enter all recipient addresses')
      return
    }

    // Validate all recipient addresses
    for (const r of recipients) {
      try {
        new PublicKey(r)
      } catch {
        alert(`Invalid recipient address: ${r}`)
        return
      }
    }

    if (!encryptionService) {
      alert('Please initialize encryption first')
      return
    }

    setTransferState((prev) => ({ ...prev, loading: true, error: undefined }))

    try {
      console.log(`Starting Multi Send (${transferState.token})...`)

      // Dynamically import Privacy Cash SDK functions
      const { WasmFactory } = await import('@lightprotocol/hasher.rs')
      const token = TOKENS[transferState.token]
      const amount = parseFloat(transferState.amount)

      const lightWasm = await WasmFactory.getInstance()

      if (transferState.token === 'SOL') {
        // SOL transfer
        const { deposit, withdraw } = await import('privacycash/utils')
        const lamports = Math.floor(amount * 1_000_000_000)
        const splitLamports = Math.floor(lamports / recipients.length)

        // Deposit SOL
        console.log(`Depositing ${amount} SOL`)
        await deposit({
          lightWasm,
          connection,
          amount_in_lamports: lamports,
          keyBasePath: '/circuit2/transaction2',
          publicKey,
          transactionSigner: async (tx: VersionedTransaction) => {
            return await signTransaction(tx)
          },
          storage: localStorage,
          encryptionService,
        })

        // Withdraw SOL to each recipient
        let txHashes: string[] = []
        for (const r of recipients) {
          console.log(`Withdrawing ${amount / recipients.length} SOL to ${r}`)
          const withdrawTxs = await withdraw({
            amount_in_lamports: splitLamports,
            connection,
            encryptionService,
            keyBasePath: '/circuit2/transaction2',
            publicKey,
            storage: localStorage,
            recipient: r,
            lightWasm,
          })
          const txHash = Array.isArray(withdrawTxs) ? withdrawTxs[0] : withdrawTxs
          txHashes.push(typeof txHash === 'string' ? txHash : txHash.toString())
        }

        setTransferState((prev) => ({
          ...prev,
          loading: false,
          txHash: txHashes.join(', '),
          amount: '',
          recipient: '',
        }))
      } else if (transferState.token === 'USDC') {
        // USDC (SPL) transfer
        const { depositSPL, withdrawSPL } = await import('privacycash/utils')
        const baseUnits = Math.floor(amount * Math.pow(10, token.decimals))
        const splitBaseUnits = Math.floor(baseUnits / recipients.length)

        // Deposit USDC
        console.log(`Depositing ${amount} USDC`)
        const depositResult = await depositSPL({
          lightWasm,
          connection,
          base_units: baseUnits,
          keyBasePath: '/circuit2/transaction2',
          publicKey,
          transactionSigner: async (tx: VersionedTransaction) => {
            return await signTransaction(tx)
          },
          storage: localStorage,
          encryptionService,
          mintAddress: token.mint,
        })
        console.log('Deposit result:', depositResult)

        // Wait a moment for the deposit to be processed
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Withdraw USDC to each recipient
        let txHashes: string[] = []
        for (const r of recipients) {
          console.log(`Withdrawing ${amount / recipients.length} USDC to ${r}`)
          try {
            // Convert mint address and recipient to PublicKey for withdrawSPL
            const mintPublicKey = new PublicKey(token.mint!)
            const recipientPublicKey = new PublicKey(r)
            
            console.log(`Attempting withdrawal with amount: ${splitBaseUnits} base units`)
            console.log(`Recipient before conversion - type: ${typeof r}, value: ${r}`)
            console.log(`Recipient after conversion - type: ${typeof recipientPublicKey}, isPublicKey: ${recipientPublicKey instanceof PublicKey}`)
            console.log(`Recipient toBuffer test:`, {
              canBuffer: typeof recipientPublicKey.toBuffer === 'function',
              buffer: recipientPublicKey.toBuffer(),
            })
            console.log(`Parameter types:`, {
              publicKey_type: typeof publicKey,
              publicKey_isPublicKey: publicKey instanceof PublicKey,
              publicKey_value: publicKey?.toBase58(),
              recipient_type: typeof recipientPublicKey,
              recipient_isPublicKey: recipientPublicKey instanceof PublicKey,
              recipient_value: recipientPublicKey.toBase58(),
              mintAddress_type: typeof mintPublicKey,
              mintAddress_isPublicKey: mintPublicKey instanceof PublicKey,
              mintAddress_value: mintPublicKey.toBase58(),
              amount_type: typeof splitBaseUnits,
              amount_value: splitBaseUnits,
            })
            const withdrawTxs = await withdrawSPL({
              connection,
              encryptionService,
              keyBasePath: '/circuit2/transaction2',
              publicKey,
              storage: localStorage,
              recipient: recipientPublicKey,
              lightWasm,
              mintAddress: mintPublicKey,
              base_units: splitBaseUnits,
            }).catch((error) => {
              console.error('[DEBUG] withdrawSPL full error:', error)
              console.error('[DEBUG] Error name:', error.name)
              console.error('[DEBUG] Error message:', error.message)
              console.error('[DEBUG] Full stack:', error.stack)
              console.error('[DEBUG] Parameters passed:', {
                publicKey: publicKey?.toBase58(),
                recipient: recipientPublicKey.toBase58(),
                mintAddress: mintPublicKey.toBase58(),
                base_units: splitBaseUnits,
              })
              throw error
            })
            const txHash = Array.isArray(withdrawTxs) ? withdrawTxs[0] : withdrawTxs
            txHashes.push(typeof txHash === 'string' ? txHash : txHash.toString())
          } catch (withdrawError) {
            console.error(`Withdraw error for recipient ${r}:`, withdrawError)
            console.error(`Error stack:`, withdrawError instanceof Error ? withdrawError.stack : '')
            throw withdrawError
          }
        }

        setTransferState((prev) => ({
          ...prev,
          loading: false,
          txHash: txHashes.join(', '),
          amount: '',
          recipient: '',
        }))
      }

      setRecipients([''])
    } catch (error: any) {
      console.error(`Multi Send transfer error (${transferState.token}):`, error)
      setTransferState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'Transfer failed. Please try again.',
      }))
    }
  }, [publicKey, signTransaction, connection, transferState, encryptionService, recipients])

  return (
    <div className="flex justify-center items-center min-h-[80vh] animate-fade-in">
      <div className="relative w-full max-w-lg p-8 rounded-3xl shadow-2xl bg-black/70 backdrop-blur-xl border border-neutral-800 overflow-hidden">
        {/* Optional: Subtle Glow */}
        <div className="absolute -inset-1 rounded-3xl pointer-events-none z-0 bg-gradient-to-tr from-purple-900/40 via-blue-900/30 to-fuchsia-900/40 opacity-40 blur-2xl" />
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-purple-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent animate-gradient-x drop-shadow-lg">
            Private Transfer
          </h2>
          <div className="mb-6 text-center">
            <div className="inline-block px-4 py-2 rounded-xl bg-black/60 border border-purple-900/30 shadow-md">
              <h3 className="text-lg font-bold text-purple-300 mb-1">Introducing Multi Send.</h3>
              <p className="text-base text-slate-200">Split funds and privately send to up to <span className="font-bold text-purple-400">5 recipients</span> in one go.<br />Private, and now more convenient.</p>
            </div>
          </div>
          <form className="space-y-6">
            <div>
              <label className="text-base font-semibold text-slate-100 block mb-2">Token</label>
              <div className="flex gap-2">
                {Object.entries(TOKENS).map(([key]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setTransferState((prev) => ({ ...prev, token: key as keyof typeof TOKENS }))
                      setSelectedToken(key as 'SOL' | 'USDC')
                    }}
                    disabled={transferState.loading}
                    className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all duration-200 ${
                      transferState.token === key
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
              <label className="text-base font-semibold text-slate-100 block mb-2">
                Amount ({transferState.token})
              </label>
              <Input
                type="number"
                placeholder="0.5"
                value={transferState.amount}
                onChange={(e) => setTransferState((prev) => ({ ...prev, amount: e.target.value }))}
                className="bg-black/40 border border-purple-800/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-700/40 text-white placeholder:text-purple-200/60 rounded-xl shadow-inner transition-all duration-200"
                disabled={transferState.loading}
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="text-base font-semibold text-slate-100 block mb-2">Recipient Addresses</label>
              {recipients.map((recipient, idx) => (
                <Input
                  key={idx}
                  type="text"
                  placeholder={`Recipient ${idx + 1} (Solana address)`}
                  value={recipient}
                  onChange={e => {
                    const newRecipients = [...recipients]
                    newRecipients[idx] = e.target.value
                    setRecipients(newRecipients)
                  }}
                  className="bg-black/40 border border-purple-800/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-700/40 text-white placeholder:text-purple-200/60 rounded-xl shadow-inner transition-all duration-200 text-xs mb-2"
                  disabled={transferState.loading}
                />
              ))}
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className={`text-xs px-3 py-1 border border-purple-800 font-semibold ${recipients.length >= 5 ? 'bg-black/70 text-purple-400 opacity-60 cursor-not-allowed' : 'bg-black/40 text-purple-300 hover:bg-purple-900/30 hover:text-white'}`}
                  disabled={recipients.length >= 5}
                  onClick={() => setRecipients([...recipients, ''])}
                >
                  + Add Recipient
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`text-xs px-3 py-1 border border-red-800 font-semibold ${recipients.length <= 1 ? 'bg-black/70 text-red-400 opacity-60 cursor-not-allowed' : 'bg-black/40 text-red-300 hover:bg-red-900/30 hover:text-white'}`}
                  disabled={recipients.length <= 1}
                  onClick={() => setRecipients(recipients.slice(0, -1))}
                >
                  - Remove
                </Button>
              </div>
            </div>

            {!encryptionInitialized && (
              <Alert className="bg-black/60 border border-purple-900/40">
                <AlertCircle className="h-4 w-4 text-purple-400" />
                <AlertDescription className="text-purple-200">
                  Initialize your encryption key first by signing a message with your wallet.
                </AlertDescription>
              </Alert>
            )}

            {transferState.error && (
              <Alert className="bg-black/60 border border-red-900/40">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{transferState.error}</AlertDescription>
              </Alert>
            )}

            {transferState.txHash && (
              <Alert className="bg-black/60 border border-green-900/40">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  Transfer successful!
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={initializeEncryption}
                variant="outline"
                disabled={transferState.loading || encryptionInitialized}
                className="flex-1 bg-gradient-to-r from-purple-800 via-blue-900 to-fuchsia-900 text-white border-none shadow-lg hover:brightness-110 hover:scale-105 transition-all duration-200"
              >
                Initialize Encryption
              </Button>
              <Button
                type="button"
                onClick={handleTransfer}
                disabled={transferState.loading || !publicKey || !encryptionInitialized}
                className="flex-1 bg-gradient-to-r from-purple-700 via-blue-800 to-fuchsia-800 text-white font-bold shadow-xl hover:brightness-125 hover:scale-105 transition-all duration-200 border-none"
              >
                {transferState.loading ? 'Processing...' : 'Deposit & Withdraw'}
              </Button>
            </div>

            <div className="text-xs text-slate-300 bg-black/40 p-4 rounded-xl mt-8 shadow-inner backdrop-blur-sm">
              <p className="font-semibold mb-1 text-purple-200">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Select token (SOL or USDC)</li>
                <li>Sign with your wallet to generate an encryption key</li>
                <li>Deposit {transferState.token} to the Privacy Cash shielded pool</li>
                <li>Withdraw to recipient address(es) in one step</li>
                <li>Your balance is encrypted and only accessible by you</li>
              </ol>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
