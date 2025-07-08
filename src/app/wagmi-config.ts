import { http, createConfig } from 'wagmi';
import { base, baseSepolia, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'; 

// Use a proper project ID - you can get one from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = getDefaultConfig({
  appName: 'chuno',
  projectId: projectId,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://84532.rpc.thirdweb.com/2441cd0fdc137b6c6a373a58de2ee453'),
  },
  ssr: false, // Disable SSR to prevent hydration issues
});
