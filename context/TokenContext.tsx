'use client'

import React, { createContext, useContext, useState } from 'react'

type TokenType = 'SOL' | 'USDC'

interface TokenContextType {
  selectedToken: TokenType
  setSelectedToken: (token: TokenType) => void
}

const TokenContext = createContext<TokenContextType | undefined>(undefined)

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [selectedToken, setSelectedToken] = useState<TokenType>('SOL')

  return (
    <TokenContext.Provider value={{ selectedToken, setSelectedToken }}>
      {children}
    </TokenContext.Provider>
  )
}

export function useSelectedToken() {
  const context = useContext(TokenContext)
  if (!context) {
    throw new Error('useSelectedToken must be used within TokenProvider')
  }
  return context
}
