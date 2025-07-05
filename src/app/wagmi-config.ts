import { http, createConfig } from 'wagmi';
import { base, baseSepolia, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'; 


export const config = getDefaultConfig({
  appName: 'chuno',
  projectId: '12',
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});
