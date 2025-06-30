import { ethers } from "ethers";

export function formatUSDC(amount: bigint): number {
    return Number(ethers.formatUnits(amount, 6));
  }
  
export function parseUSDC(amount: string): bigint {
    return ethers.parseUnits(amount, 6);
}