import { http, createConfig } from 'wagmi';
import { base, baseSepolia, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'; 


const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet],
    },
  ],
  {
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
  }
);


export const config = getDefaultConfig({
  appName: 'Cricket Betting',
  projectId: '1234567890',
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});
