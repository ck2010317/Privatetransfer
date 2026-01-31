# Privatetransfer

A privacy-focused Solana payment utility that enables encrypted SOL/USDC transfers and shareable payment links with hidden recipient addresses using the Privacy Cash SDK.

## About

Privatetransfer is a web application that leverages the Privacy Cash SDK to provide users with a secure and private way to transfer tokens on the Solana blockchain. Your transaction data and recipient information are encrypted and stored securely, ensuring maximum privacy for sensitive financial transfers.

### Key Features

- **Private Transfers**: Encrypt SOL and USDC transfers using the Privacy Cash shielded pool
- **Multi-Send**: Split funds and privately send to up to 5 recipients in a single transaction
- **Payment Links**: Generate shareable payment links with hidden recipient addresses
- **Encrypted Storage**: Recipient information is stored server-side (Vercel KV), not exposed in URLs
- **Wallet Integration**: Support for Phantom and Solflare wallets
- **Real-time Balance**: Display SOL and USDC balances with token selection

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Solana wallet (Phantom or Solflare)
- Solana mainnet RPC access (Helius endpoint included)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ck2010317/Privatetransfer.git
cd Privatetransfer
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the project root:
```env
# For Vercel KV (payment link storage)
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token

# Optional: Custom RPC endpoint
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=your_key
```

4. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Private Transfers (Multi-Send)

1. **Connect Wallet**: Link your Phantom or Solflare wallet
2. **Initialize Encryption**: Sign a message with your wallet to generate an encryption key
3. **Select Token**: Choose between SOL or USDC
4. **Enter Amount & Recipients**: Specify the amount and add up to 5 recipient addresses
5. **Deposit & Withdraw**: 
   - Your tokens are deposited to the Privacy Cash shielded pool
   - Funds are encrypted using your derived encryption key
   - Tokens are withdrawn to recipients in complete privacy

### Privacy Cash SDK Integration

The app uses the Privacy Cash SDK for:

- **Deposit Function**: Encrypts your tokens and adds them to the shielded pool
  ```typescript
  await deposit({
    lightWasm,
    connection,
    amount_in_lamports,
    keyBasePath: '/circuit2/transaction2',
    publicKey,
    transactionSigner,
    storage: localStorage,
    encryptionService,
  })
  ```

- **Withdraw Function**: Withdraws encrypted funds to recipient addresses
  ```typescript
  await withdraw({
    amount_in_lamports: splitLamports,
    connection,
    encryptionService,
    keyBasePath: '/circuit2/transaction2',
    publicKey,
    storage: localStorage,
    recipient,
    lightWasm,
  })
  ```

### Payment Links

1. **Create Link**: Share a payment link without exposing your recipient address
2. **Server-Side Storage**: Recipient data is stored in Vercel KV with 7-day expiry
3. **Shareable**: Only a random ID is in the URL (e.g., `/pay/abc123xyz`)
4. **Privacy**: Recipients pay without seeing the actual destination wallet until payment is initiated

## Architecture

### Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Solana mainnet via Helius RPC
- **Privacy**: Privacy Cash SDK, Light Protocol WASM
- **Storage**: Vercel KV for payment links (server-side)
- **Wallets**: Solana Wallet Adapter with Phantom & Solflare

### File Structure

```
app/
├── api/
│   ├── paylink/route.ts       # Payment link storage API
│   └── volume/route.ts         # Volume tracking
├── pay/
│   ├── [id]/page.tsx          # Payment page (fetches from API)
│   └── page.tsx               # Payment links page
├── page.tsx                   # Home page
└── layout.tsx                 # Root layout

components/
├── PrivateTransferForm.tsx    # Multi-send transfers
├── CreatePaymentLink.tsx      # Payment link creation
├── WalletButton.tsx           # Custom wallet button
├── WalletInfo.tsx             # Display wallet balance
└── ui/                        # Shadcn UI components

context/
└── TokenContext.tsx           # Global token selection state

lib/
├── signature.ts               # Wallet signature utilities
└── utils.ts                   # Helper functions

public/
└── circuit2/                  # Privacy Cash circuits (WASM)
```

## Roadmap

### Phase 1: Core Features ✅
- [x] SOL private transfers with Multi-Send
- [x] USDC private transfers with Multi-Send
- [x] Payment link generation with server-side storage
- [x] Wallet integration (Phantom, Solflare)
- [x] Token balance display
- [x] Production deployment

### Phase 2: Enhanced Privacy
- [ ] Stealth addresses for payment links
- [ ] Time-locked transfers (scheduled payments)
- [ ] Multi-sig payment authorization
- [ ] Privacy audit and security review
- [ ] Zero-knowledge proof enhancements

### Phase 3: User Experience
- [ ] Mobile app (React Native)
- [ ] Transaction history
- [ ] Payment link analytics (non-identifying)
- [ ] Batch transfer templates
- [ ] QR code payment links

### Phase 4: Advanced Features
- [ ] Cross-chain transfers (Ethereum, Polygon)
- [ ] Token swaps integrated with privacy
- [ ] DAO treasury management with privacy
- [ ] Privacy-focused contract interactions
- [ ] Custom circuit support

### Phase 5: Ecosystem
- [ ] Browser extension
- [ ] API for third-party integrations
- [ ] Privacy Cash SDK documentation
- [ ] Community privacy tools library
- [ ] Enterprise payment solutions

## Security

- **End-to-End Encryption**: Encryption keys are derived from your wallet signature
- **Server-Side Storage**: Recipient addresses are stored server-side, not in URLs
- **No Seed Exposure**: Private keys are never shared or stored
- **Privacy Cash Protocol**: Leverages proven zero-knowledge proofs
- **7-Day Expiry**: Payment links automatically expire for additional security

## Configuration

### Supported Tokens

- **SOL**: Native Solana token (9 decimals)
- **USDC**: USD Coin on Solana (6 decimals, mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `KV_REST_API_URL` | Vercel KV REST API URL | For payment links |
| `KV_REST_API_TOKEN` | Vercel KV API token | For payment links |
| `NEXT_PUBLIC_RPC_ENDPOINT` | Custom Solana RPC | Optional |

## Building for Production

```bash
pnpm build
pnpm start
```

Build uses webpack mode for optimal WASM handling and circuit file support.

## Troubleshooting

### Payment Link Errors
- Ensure Vercel KV environment variables are configured
- Check that the 7-day expiry hasn't passed
- Verify recipient address format

### Encryption Initialization Issues
- Reconnect your wallet
- Try a different browser tab
- Ensure you're signing the message, not rejecting it

### Transaction Failures
- Verify sufficient SOL for gas fees
- Check recipient address validity
- Ensure sufficient token balance

## Contributing

This is a privacy-focused project. For security concerns, please report responsibly.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub or check the project repository.

---

**Website**: https://privatetransfer.site

**Live Demo**: https://privatee-tan.vercel.app

**GitHub**: https://github.com/ck2010317/Privatetransfer
