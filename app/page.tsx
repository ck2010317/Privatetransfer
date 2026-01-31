'use client'

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { TokenProvider } from '@/context/TokenContext'
const WalletInfo = dynamic(() => import('@/components/WalletInfo'), { ssr: false })
const WalletButton = dynamic(() => import('@/components/WalletButton'), { ssr: false })
const CreatePaymentLink = dynamic(() => import('@/components/CreatePaymentLink'), { ssr: false })
import '@solana/wallet-adapter-react-ui/styles.css'

// Dynamically import PrivateTransferForm to avoid bundling WASM modules at build time
const PrivateTransferForm = dynamic(() => import('@/components/PrivateTransferForm'), {
  loading: () => <div className="h-96 bg-slate-800/50 border border-slate-700 rounded-lg animate-pulse" />,
  ssr: false,
})

const PageContent = dynamic(
  () =>
    Promise.resolve(function PageContentComponent() {
      const [activeTab, setActiveTab] = useState<'transfer' | 'paylink'>('transfer')
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PrivatePay
            </h1>
            <p className="text-sm text-slate-400 mt-1">Private SOL & USDC Transfers on Solana</p>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 bg-black/40 p-1 rounded-xl w-fit border border-purple-800/30">
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'transfer'
                ? 'bg-gradient-to-r from-purple-700 to-blue-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Send Payment
          </button>
          <button
            onClick={() => setActiveTab('paylink')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'paylink'
                ? 'bg-gradient-to-r from-purple-700 to-blue-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Payment Links
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Transfer Form or Payment Links */}
          <div className="lg:col-span-2">
            {activeTab === 'transfer' ? (
              <PrivateTransferForm />
            ) : (
              <div className="flex justify-center items-center min-h-[80vh] animate-fade-in">
                <div className="relative w-full max-w-lg p-8 rounded-3xl shadow-2xl bg-black/70 backdrop-blur-xl border border-neutral-800 overflow-hidden">
                  <div className="absolute -inset-1 rounded-3xl pointer-events-none z-0 bg-gradient-to-tr from-purple-900/40 via-blue-900/30 to-fuchsia-900/40 opacity-40 blur-2xl" />
                  <div className="relative z-10">
                    <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
                      Payment Links
                    </h2>
                    <CreatePaymentLink />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Wallet Info */}
          <div>
            <WalletInfo />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>
            PrivatePay enables private SOL & USDC transfers using{' '}
            <a
              href="https://privacy.cash"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Privacy Cash SDK
            </a>
          </p>
          <p className="mt-2">Non-custodial • Zero-knowledge • Sender & Recipient Unlinkable</p>
        </div>
      </footer>
    </div>
  )
    }),
  { ssr: false }
)

export default function Page() {
  const network = 'mainnet-beta'
  const endpoint = 'https://mainnet.helius-rpc.com/?api-key=59f7f4c5-24e2-4ecd-a46e-9bcccda806d6'
  
  // Create phantom adapter with isStandardWallet set to false to force it to show
  const wallets = useMemo(() => {
    const phantom = new PhantomWalletAdapter()
    const solflare = new SolflareWalletAdapter()
    // Force Phantom to display in the modal
    ;(phantom as any).isStandardWallet = false
    return [phantom, solflare]
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TokenProvider>
            <PageContent />
          </TokenProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
