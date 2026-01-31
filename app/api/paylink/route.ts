import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

// Generate a random ID
function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = ''
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

// POST - Create a new payment link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipient, token, amount, label } = body

    if (!recipient || !token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate unique ID
    const id = generateId()

    // Store in KV (expires in 7 days)
    await kv.set(`paylink:${id}`, {
      recipient,
      token,
      amount: amount || null,
      label: label || null,
      createdAt: Date.now(),
    }, { ex: 60 * 60 * 24 * 7 }) // 7 days expiry

    return NextResponse.json({ id })
  } catch (error) {
    console.error('Error creating payment link:', error)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}

// GET - Retrieve payment link data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    }

    const data = await kv.get(`paylink:${id}`)

    if (!data) {
      return NextResponse.json({ error: 'Payment link not found or expired' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching payment link:', error)
    return NextResponse.json({ error: 'Failed to fetch payment link' }, { status: 500 })
  }
}
