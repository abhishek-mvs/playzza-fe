'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS } from '../app/constants';
import { Contest, ContestStats } from '../types/contest';
import { filterLiveContests } from '@/utils/filters';



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
  const { data: contests, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
    abi: ABIS.PREDICTION_CONTEST,
    functionName: 'getActiveContestsByMatchId',
    args: [matchId],
  });
  
  if (!contests) return {
    contests: null,
    isLoading,
    refetch,
  };

  const filteredContests = filterLiveContests(contests as Contest[]);
  return {
    contests: filteredContests,
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
  console.log("contests", contests);
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
  return {
    stats: stats as ContestStats | null,
    isLoading,
    refetch,
  };
}

export function useContestById(contestId: string) {
  const { data: contest, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
    abi: ABIS.PREDICTION_CONTEST,
    functionName: 'getContest',
    args: [BigInt(contestId)],
  });

  return {
    contest: contest as Contest | null,
    isLoading,
    refetch,
  };
}

export function useActiveContests() {
  const { data: contests, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
    abi: ABIS.PREDICTION_CONTEST,
    functionName: 'getActiveContests',
  });

  if (!contests) return {
    contests: null,
    isLoading,
    refetch,
  };

  return {
    contests: contests as Contest[] | null,
    isLoading,
    refetch,
  };
}

