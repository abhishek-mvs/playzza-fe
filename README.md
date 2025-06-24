# Prediction Market DApp

A decentralized prediction market built on Base that enables users to create and participate in binary prediction contests with ERC20 token stakes.

## Features

- 🎯 **Binary Prediction Contests**: Create contests with binary outcomes (true/false)
- 🔒 **Secure Staking**: ERC20 token-based staking using USDC
- ⚖️ **AVS Manager Settlement**: Centralized settlement authority for contest resolution
- 📊 **Contest Management**: View and manage all available contests
- 🦊 **MetaMask Integration**: Seamless wallet connection

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: Viem, Wagmi
- **Styling**: Tailwind CSS
- **Network**: Base (Ethereum L2)

## Getting Started

### Prerequisites

- Node.js 18+ 
- MetaMask wallet
- Base network configured in MetaMask

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prediction-market-fe
```

2. Install dependencies:
```bash
npm install
```

3. Configure contract addresses:
   - Open `src/app/constants.ts`
   - Update `CONTRACT_ADDRESSES` with your deployed contract addresses:
     - `PREDICTION_CONTEST`: Your deployed PredictionContest contract address
     - `USDC`: Your deployed USDC token contract address

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Connect Wallet**: Click "Connect MetaMask" to connect your wallet
2. **Create Contest**: Fill out the contest form with title, details, statement, and stake amount
3. **Join Contest**: Browse available contests and join ones you want to participate in
4. **Settlement**: Contests are settled by the designated AVS Manager

## Smart Contract Functions

Based on the test file, the main functions used are:

- `createContest(title, details, statement, stakeAmount)`: Create a new prediction contest
- `joinContest(id, stakeAmount)`: Join an existing contest
- `getContests()`: Get all available contests
- `getContest(id)`: Get specific contest details
- `settle(id, verdict)`: Settle a contest (AVS Manager only)

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ConnectButton.tsx
│   │   ├── CreateContest.tsx
│   │   └── ContestList.tsx
│   ├── hooks/
│   │   ├── useContests.ts
│   │   └── useApproveToken.ts
│   ├── constants.ts
│   ├── providers.tsx
│   ├── wagmi-config.ts
│   └── page.tsx
└── data/
    ├── predictionContestAbi.json
    └── usdcERC20.json
```

## Configuration

### Base Network Setup

Add Base network to MetaMask:
- Network Name: Base
- RPC URL: https://mainnet.base.org
- Chain ID: 8453
- Currency Symbol: ETH
- Block Explorer: https://basescan.org

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
