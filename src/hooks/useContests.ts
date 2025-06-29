'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS } from '../app/constants';
import { Contest, ContestStats } from '../types/contest';



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

export function useContestsByMatchId(matchId: string) {
  const { data: contest, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
    abi: ABIS.PREDICTION_CONTEST,
    functionName: 'getContestsByMatchId',
    args: [matchId],
  });

  return {
    contest: contest as Contest[] | null,
    isLoading,
    refetch,
  };
}

export function useContestsByUser(user: string) {
  const { data: contests, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
    abi: ABIS.PREDICTION_CONTEST,
    functionName: 'getUserContests',
    args: [user],
  });

  return {
    contests: contests as Contest[] | null,
    isLoading,
    refetch,
  };
}

export function useContestStatsByMatchId(matchId: string) {
  const { data: stats, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
    abi: ABIS.PREDICTION_CONTEST,
    functionName: 'getContestStatsByMatchId',
    args: [matchId],
  });
  console.log("stats", stats);
  return {
    stats: stats as ContestStats | null,
    isLoading,
    refetch,
  };
}
