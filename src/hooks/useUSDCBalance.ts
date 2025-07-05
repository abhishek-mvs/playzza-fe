'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS } from '../app/constants';

export function useUSDCBalance(address?: string) {
  const { data: balance, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
    abi: ABIS.USDC,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: balance as bigint || 0n,
    isLoading,
    refetch,
  };
} 