import { ethers } from "ethers";

export function formatUSDC(amount: bigint): number {
    return Number(ethers.formatUnits(amount, 6));
  }
  
export function parseUSDC(amount: string): bigint {
    return ethers.parseUnits(amount, 6);
}

// Calculate the amount needed to join a contest based on odds
export function calculateJoinAmount(stake: bigint, odds: bigint): bigint {
    // Calculate join amount: stake * odds (both are already scaled by 1e6)
    return (stake * odds) / BigInt(1e6);
}

// Calculate potential profit if the user wins
export function calculatePotentialProfit(stake: bigint): bigint {
    // The profit is the original stake amount
    return stake;
}

// Format odds for display (e.g., "3:2" or "1:2")
export function formatOdds(odds: bigint): string {
    const oddsDecimal = Number(ethers.formatUnits(odds, 6));
    
    // Convert decimal to fraction
    if (oddsDecimal >= 1) {
        // For odds >= 1, show as "X:1"
        return `${oddsDecimal.toFixed(0)}:1`;
    } else {
        // For odds < 1, show as "1:X"
        const inverse = 1 / oddsDecimal;
        return `1:${inverse.toFixed(0)}`;
    }
}

export function formatTimeRemaining(expiryTimestamp: bigint): string {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeRemaining = Number(expiryTimestamp - now);
    
    if (timeRemaining <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  