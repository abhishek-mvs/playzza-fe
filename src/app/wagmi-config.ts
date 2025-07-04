import { http, createConfig } from 'wagmi';
import { base, baseSepolia, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [hardhat, base,baseSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [hardhat.id]: http(),
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
}); 