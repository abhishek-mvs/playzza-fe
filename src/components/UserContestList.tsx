'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES } from '../app/constants';
import { Contest } from '../types/contest';
import { Button } from './ui/Button';

interface ContestListProps {
  contests: Contest[];
  isLoading: boolean;
  onContestCancelled: () => void;
}

type FilterType = 'active' | 'pending' | 'completed';

export function ContestList({ contests, isLoading, onContestCancelled }: ContestListProps) {
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

  const { address } = useAccount();
  const [cancellingContestId, setCancellingContestId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  const { writeContract: writeCancel, data: cancelHash } = useWriteContract();
  const { isLoading: isCancelLoading, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({
    hash: cancelHash,
  });

  const handleCancelContest = async (contestId: number) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setCancellingContestId(contestId);
      
      writeCancel({
        address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
        abi: [
          {
            name: 'cancelContest',
            type: 'function',
            inputs: [
              { name: 'contestId', type: 'uint256' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'cancelContest',
        args: [BigInt(contestId)],
      });
    } catch (error) {
      console.error('Error cancelling contest:', error);
      alert('Error cancelling contest. Please try again.');
      setCancellingContestId(null);
    }
  };

  if (isCancelSuccess) {
    onContestCancelled();
    setCancellingContestId(null);
  }

  // Filter contests based on active filter
  const filteredContests = contests.filter((contest) => {
    switch (activeFilter) {
      case 'active':
        return contest.active === true;
      case 'pending':
        return contest.active === false && contest.settled === false;
      case 'completed':
        return contest.active === false && contest.settled === true;
      default:
        return true;
    }
  });

  const getFilterCount = (filterType: FilterType) => {
    return contests.filter((contest) => {
      switch (filterType) {
        case 'active':
          return contest.active === true;
        case 'pending':
          return contest.active === false && contest.settled === false;
        case 'completed':
          return contest.active === false && contest.settled === true;
        default:
          return false;
      }
    }).length;
  };

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
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800 bg-opacity-50 p-1 rounded-lg">
        {[
          { key: 'active' as FilterType, label: 'Active', icon: '🟢' },
          { key: 'pending' as FilterType, label: 'Pending', icon: '🟡' },
          { key: 'completed' as FilterType, label: 'Completed', icon: '✅' }
        ].map((filter) => (
          <Button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            variant={activeFilter === filter.key ? "primary" : "ghost"}
            size="sm"
            className={`flex-1 ${
              activeFilter === filter.key
                ? 'shadow-lg'
                : ''
            }`}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
            <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
              {getFilterCount(filter.key)}
            </span>
          </Button>
        ))}
      </div>

      {/* Contest List */}
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {filteredContests.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">
                {activeFilter === 'active' ? '🟢' : activeFilter === 'pending' ? '🟡' : '✅'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              No {activeFilter} contests found.
            </p>
          </div>
        ) : (
          filteredContests.map((contest, index) => {
            const isCreator = contest.creator.toLowerCase() === address?.toLowerCase();
            const isOpponent = contest.opponent.toLowerCase() === address?.toLowerCase();
            const canCancel = contest.active && !contest.settled && isCreator;
            const isCancelling = cancellingContestId === index;

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

                {(isCreator || isOpponent) && !contest.settled && (
                  <div className="flex justify-between items-center text-sm text-gray-400 bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                    <span>
                      {isCreator ? '🎯 You created this contest' : '👤 You joined this contest'}
                    </span>
                    {canCancel && (
                      <Button
                        onClick={() => handleCancelContest(index)}
                        disabled={isCancelling || isCancelLoading}
                        variant="danger"
                        size="sm"
                        loading={isCancelling || isCancelLoading}
                      >
                        {isCancelling ? 'Cancelling...' : isCancelLoading ? 'Processing...' : 'Cancel Contest'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 