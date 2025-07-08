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
import { useCancelContest } from '../hooks/useCancelContest';

interface ContestListProps {
  contests: Contest[];
  isLoading: boolean;
  onContestCancelled: () => void;
}

type FilterType = 'active' | 'pending' | 'completed';

export function ContestList({ contests, isLoading, onContestCancelled }: ContestListProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ALL hooks must be called at the top level before any conditional returns
  const router = useRouter();
  const { address } = useAccount();
  const { 
    handleCancelContest, 
    cancellingContestId, 
    cancellingContest, 
    isCancelLoading, 
    isCancelSuccess,
    error: cancelError,
    clearError: clearCancelError
  } = useCancelContest();
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  const handleContestClick = (contest: Contest) => {
    console.log("contest", contest);
    const contestId = contest.id;
    console.log("contestId", contestId);
    if (contestId !== undefined) {
      router.push(`/contests/${contestId}`);
    }
  };

  useEffect(() => {
    if (isCancelSuccess) {
      onContestCancelled();
    }
  }, [isCancelSuccess, onContestCancelled]);

  // Handle cancel errors
  useEffect(() => {
    if (cancelError) {
      console.error('Cancel contest error:', cancelError);
    }
  }, [cancelError]);

  // Filter contests based on active filter - add null check
  const filteredContests = contests?.filter((contest) => {
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
  }) || [];

  const getFilterCount = (filterType: FilterType) => {
    return contests?.filter((contest) => {
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
    }).length || 0;
  };

  console.log("contests", contests);
  console.log("isLoading", isLoading);

  // Don't render until mounted to prevent SSR issues
  if (!mounted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
        <p className="text-gray-400 text-lg">Initializing...</p>
      </div>
    );
  }

  // Now we can have conditional returns after all hooks are called
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
          <img src="/icons/emptyBox.png" alt="Empty" className="w-8 h-8" />
        </div>
        <p className="text-gray-400 text-lg">No contests available. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {cancelError && (
        <div className="bg-red-900/30 border border-red-700/30 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-red-400 font-semibold mb-2">Error Cancelling Contest</h4>
              <p className="text-red-300 text-sm">{cancelError}</p>
            </div>
            <button
              onClick={clearCancelError}
              className="ml-4 text-red-400 hover:text-red-300 text-sm font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isCancelSuccess && (
        <div className="bg-green-900/30 border border-green-700/30 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-400 mr-3">✓</div>
            <div>
              <h4 className="text-green-400 font-semibold">Contest Cancelled Successfully!</h4>
              <p className="text-green-300 text-sm">Your stake has been returned to your wallet.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800 bg-opacity-50 p-1 rounded-lg">
        {[
          { key: 'active' as FilterType, label: 'Active' },
          { key: 'pending' as FilterType, label: 'Pending' },
          { key: 'completed' as FilterType, label: 'Completed' }
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
            <div key={contest.id.toString()} onClick={() => handleContestClick(contest)}>
            <UserContestCard
              contest={contest}
              userAddress={address}
              activeFilter={activeFilter}
              isCancelling={cancellingContestId === Number(contest.id)}
              isCancelLoading={cancellingContest}
              onCancel={() => handleCancelContest(contest.id)}
            />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 