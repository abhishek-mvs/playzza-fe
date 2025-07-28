import { http, createConfig } from 'wagmi';
import { base, baseSepolia, hardhat, morphHolesky } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'; 

// Use a proper project ID - you can get one from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = getDefaultConfig({
  appName: 'chuno',
  projectId: projectId,
  chains: [morphHolesky],
  transports: {
    [morphHolesky.id]: http(),
  },
  ssr: false, // Disable SSR to prevent hydration issues
});
