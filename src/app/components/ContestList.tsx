'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useApproveToken } from '../hooks/useApproveToken';
import { CONTRACT_ADDRESSES } from '../constants';

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

interface ContestListProps {
  contests: Contest[];
  isLoading: boolean;
  onContestJoined: () => void;
}

export function ContestList({ contests, isLoading, onContestJoined }: ContestListProps) {
  const { address } = useAccount();
  const [joiningContestId, setJoiningContestId] = useState<number | null>(null);

  const { writeContract: writeJoin, data: joinHash } = useWriteContract();
  const { isLoading: isJoinLoading, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinHash,
  });

  const { approve, isApproving } = useApproveToken();

  const handleJoinContest = async (contestId: number, stakeAmount: bigint) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setJoiningContestId(contestId);
      
      // First approve tokens
      await approve(stakeAmount);
      
      // Then join contest
      writeJoin({
        address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
        abi: [
          {
            name: 'joinContest',
            type: 'function',
            inputs: [
              { name: 'id', type: 'uint256' },
              { name: 'stakeAmount', type: 'uint256' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'joinContest',
        args: [BigInt(contestId), stakeAmount],
      });
    } catch (error) {
      console.error('Error joining contest:', error);
      alert('Error joining contest. Please try again.');
      setJoiningContestId(null);
    }
  };

  if (isJoinSuccess) {
    onContestJoined();
    setJoiningContestId(null);
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading contests...</p>
      </div>
    );
  }

  if (!contests || contests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No contests available. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {contests.map((contest, index) => {
        const isCreator = contest.creator.toLowerCase() === address?.toLowerCase();
        const isOpponent = contest.opponent.toLowerCase() === address?.toLowerCase();
        const canJoin = contest.active && !contest.settled && !isCreator && !isOpponent;
        const isJoining = joiningContestId === index;

        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{contest.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                contest.settled 
                  ? 'bg-gray-200 text-gray-700' 
                  : contest.active 
                    ? 'bg-green-200 text-green-700' 
                    : 'bg-red-200 text-red-700'
              }`}>
                {contest.settled ? 'Settled' : contest.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{contest.details}</p>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Statement: {contest.statement}
            </p>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">
                Stake: {formatUnits(contest.stake, 6)} USDC
              </span>
              <span className="text-xs text-gray-500">
                Creator: {contest.creator.slice(0, 6)}...{contest.creator.slice(-4)}
              </span>
            </div>

            {contest.settled && (
              <div className="mb-3 p-2 bg-blue-100 rounded">
                <span className="text-sm font-medium">
                  Result: {contest.verdict ? '✅ True' : '❌ False'}
                </span>
              </div>
            )}

            {canJoin && (
              <button
                onClick={() => handleJoinContest(index, contest.stake)}
                disabled={isJoining || isJoinLoading || isApproving}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                {isJoining ? 'Joining...' : isJoinLoading ? 'Processing...' : isApproving ? 'Approving...' : 'Join Contest'}
              </button>
            )}

            {(isCreator || isOpponent) && !contest.settled && (
              <div className="text-sm text-gray-600">
                {isCreator ? 'You created this contest' : 'You joined this contest'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 