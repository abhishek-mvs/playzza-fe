'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS } from '../app/constants';

interface Contest {
  creator: string;
  title: string;
  details: string;
  statement: string;
  stake: bigint;
  opponent: string;
  settled: boolean;
  verdict: boolean;
  active: boolean;
}

export function useContests() {
  const { data: contests, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
    abi: ABIS.PREDICTION_CONTEST,
    functionName: 'getContests',
  });

  return {
    contests: contests as Contest[] || [],
    isLoading,
    refetch,
  };
} 