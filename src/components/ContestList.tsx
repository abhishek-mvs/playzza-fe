'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useApproveToken } from '../hooks/useApproveToken';
import { CONTRACT_ADDRESSES } from '../app/constants';
import { Contest } from '../types/contest';

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
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
        <p className="text-gray-400 text-lg">Loading contests...</p>
      </div>
    );
  }

  if (!contests || contests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <p className="text-gray-400 text-lg">No contests available. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      {contests.map((contest, index) => {
        const isCreator = contest.creator.toLowerCase() === address?.toLowerCase();
        const isOpponent = contest.opponent.toLowerCase() === address?.toLowerCase();
        const canJoin = contest.active && !contest.settled && !isCreator && !isOpponent;
        const isJoining = joiningContestId === index;

        return (
          <div key={index} className="glass rounded-xl p-6 hover:bg-white hover:bg-opacity-10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors duration-300">
                {contest.title}
              </h3>
              <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                contest.settled 
                  ? 'bg-gray-600 text-gray-200' 
                  : contest.active 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
              }`}>
                {contest.settled ? 'Settled' : contest.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-gray-400 mb-3 leading-relaxed">{contest.details}</p>
            <p className="text-sm font-semibold text-blue-300 mb-4 bg-blue-900 bg-opacity-20 p-3 rounded-lg">
              Statement: {contest.statement}
            </p>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-300 font-medium">
                Stake: <span className="text-green-400">{formatUnits(contest.stake, 6)} USDC</span>
              </span>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                Creator: {contest.creator.slice(0, 6)}...{contest.creator.slice(-4)}
              </span>
            </div>

            {contest.settled && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg border border-blue-500 border-opacity-30">
                <span className="text-sm font-semibold text-white">
                  Result: {contest.verdict ? '✅ True' : '❌ False'}
                </span>
              </div>
            )}

            {canJoin && (
              <button
                onClick={() => handleJoinContest(index, contest.stake)}
                disabled={isJoining || isJoinLoading || isApproving}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {isJoining ? 'Joining...' : isJoinLoading ? 'Processing...' : isApproving ? 'Approving...' : 'Join Contest'}
              </button>
            )}

            {(isCreator || isOpponent) && !contest.settled && (
              <div className="text-sm text-gray-400 bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                {isCreator ? '🎯 You created this contest' : '👤 You joined this contest'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 