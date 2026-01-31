import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PublicKey } from '@solana/web3.js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Common SPL Token Definitions
export const SPL_TOKENS = {
  SOL: {
    name: 'SOL',
    symbol: 'SOL',
    decimals: 9,
    icon: '◎',
    isNative: true,
  },
  USDC: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    icon: 'U',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    icon: 'T',
  },
}

export type TokenType = keyof typeof SPL_TOKENS

export interface Token {
  name: string
  symbol: string
  decimals: number
  mint?: string
  icon?: string
  isNative?: boolean
}

export function getTokenBySymbol(symbol: string): Token | null {
  const token = SPL_TOKENS[symbol as TokenType]
  return token || null
}

export function convertToBaseUnits(amount: number, decimals: number): number {
  return Math.floor(amount * Math.pow(10, decimals))
}

export function convertFromBaseUnits(amount: number, decimals: number): number {
  return amount / Math.pow(10, decimals)
}

export function formatTokenAmount(amount: number, decimals: number, displayDecimals: number = 2): string {
  const converted = convertFromBaseUnits(amount, decimals)
  return converted.toFixed(displayDecimals)
}
