'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { useRouter } from 'next/navigation';
import { CONTRACT_ADDRESSES } from '../app/constants';
import { Contest } from '../types/contest';
import { Button } from './ui/Button';
import { formatUSDC, calculateJoinAmount } from '@/utils/formatters';
import CountdownTimer from './CountdownTimer';
import UserContestCard from './UserContestCard';

interface ContestListProps {
  contests: Contest[];
  isLoading: boolean;
  onContestCancelled: () => void;
}

type FilterType = 'active' | 'pending' | 'completed';

export function ContestList({ contests, isLoading, onContestCancelled }: ContestListProps) {

  const router = useRouter();

  const handleContestClick = (contest: Contest) => {
    console.log("contest", contest);
    // Create the same key used in the mapping
    const contestId = contest.id;
    console.log("contestId", contestId);
    if (contestId !== undefined) {
      router.push(`/contests/${contestId}`);
    }
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
  console.log("contests", contests);
  console.log("isLoading", isLoading);
  const { address } = useAccount();
  const [cancellingContestId, setCancellingContestId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  const { writeContract: writeCancel, data: cancelHash } = useWriteContract();
  const { isLoading: isCancelLoading, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({
    hash: cancelHash,
  });

  const handleCancelContest = async (contestId: bigint) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      console.log("contestId", contestId);
      setCancellingContestId(Number(contestId));
      
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
        args: [contestId],
      });
    } catch (error) {
      console.error('Error cancelling contest:', error);
      alert('Error cancelling contest. Please try again.');
      setCancellingContestId(null);
    }
  };

  useEffect(() => {
    if (isCancelSuccess) {
      onContestCancelled();
      setCancellingContestId(null);
    }
  }, [isCancelSuccess, onContestCancelled]);

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
            <span className="ml-2 bg-blue-500 bg-opacity-30 text-blue-200 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-400 border-opacity-30">
              {getFilterCount(filter.key)}
            </span>
          </Button>
        ))}
      </div>

      {/* Contest List as Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[70vh] overflow-y-auto">
        {filteredContests.length === 0 ? (
          <div className="col-span-full text-center py-8">
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
          filteredContests.map((contest) => (
            <div onClick={() => handleContestClick(contest)}>
            <UserContestCard
              key={contest.id.toString()}
              contest={contest}
              userAddress={address}
              activeFilter={activeFilter}
              isCancelling={cancellingContestId !== null && BigInt(cancellingContestId) === contest.id}
              isCancelLoading={isCancelLoading}
              onCancel={handleCancelContest}
            />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 