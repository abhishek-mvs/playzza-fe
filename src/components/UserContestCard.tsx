import { Contest } from '@/types/contest';
import { Button } from './ui/Button';
import CountdownTimer from './CountdownTimer';
import { formatUSDC, calculateJoinAmount } from '@/utils/formatters';
import React from 'react';
import { getSettleTimeMsg } from '@/utils/utils';

type FilterType = 'active' | 'pending' | 'completed';

interface UserContestCardProps {
  contest: Contest;
  userAddress: string | undefined;
  activeFilter: FilterType;
  isCancelling: boolean;
  isCancelLoading: boolean;
  onCancel: (contestId: bigint) => void;
}

const UserContestCard: React.FC<UserContestCardProps> = ({
  contest,
  userAddress,
  activeFilter,
  isCancelling,
  isCancelLoading,
  onCancel,
}) => {
  const isCreator = contest.creator.toLowerCase() === userAddress?.toLowerCase();
  const isOpponent = contest.opponent.toLowerCase() === userAddress?.toLowerCase();
  const canCancel = contest.active && !contest.settled && isCreator;
  const hasOpponent = contest.opponent !== '0x0000000000000000000000000000000000000000';

  // Calculate invested and profit
  let invested: bigint = 0n;
  let profit: bigint = 0n;
  if (isCreator) {
    invested = contest.stake;
    profit = hasOpponent ? contest.opponentStake : calculateJoinAmount(contest.stake, contest.odds);
  } else if (isOpponent) {
    invested = contest.opponentStake;
    profit = contest.stake;
  }

  // Completed logic
  let completedStatus: 'cancelled' | 'won' | 'lost' | null = null;
  let completedAmount: bigint = 0n;
  if (activeFilter === 'completed') {
    if (contest.cancelled) {
      completedStatus = 'cancelled';
    } else {
      // Win/loss logic
      const userWon = (isCreator && contest.verdict) || (isOpponent && !contest.verdict);
      completedStatus = userWon ? 'won' : 'lost';
      completedAmount = userWon ? profit : invested * -1n;
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-950/80 to-purple-900/80 p-5 rounded-2xl border border-gray-700 border-opacity-40 shadow-xl flex flex-col min-h-[240px] hover:-translate-y-2 transition-transform duration-200 ease-in-out">
      <div className="flex justify-between items-start mb-2">
        <div className="text-lg font-bold text-green-400">
          {formatUSDC(profit)} USDC
        </div>
        {(activeFilter === 'active' || activeFilter === 'pending') && (
          <CountdownTimer 
            expiryTimestamp={activeFilter === 'pending' && hasOpponent ? contest.settleTime : contest.contestExpiry} 
            size="sm" 
            showResults={activeFilter === 'pending' && hasOpponent}
          />
        )}
      </div>
      <div className="flex-1 mb-2">
        <h3 className="text-lg font-semibold text-blue-300 mb-2 line-clamp-2 break-words overflow-hidden">"{contest.statement}"</h3>
      </div>
      {/* Status/Result Section */}
      {activeFilter === 'completed' && (
        <div className="mb-2">
          {completedStatus === 'cancelled' ? (
            <span className="inline-block px-3 py-1 text-xs rounded-full font-semibold bg-gray-600 text-gray-200">Cancelled - Funds Returned</span>
          ) : completedStatus === 'won' ? (
            <span className="inline-block px-3 py-1 text-xs rounded-full font-semibold bg-green-700 text-green-200">You Won {formatUSDC(completedAmount < 0n ? completedAmount * -1n : completedAmount)} USDC</span>
          ) : (
            <span className="inline-block px-3 py-1 text-xs rounded-full font-semibold bg-red-700 text-red-200">You Lost {formatUSDC(completedAmount < 0n ? completedAmount * -1n : completedAmount)} USDC</span>
          )}
        </div>
      )}
      {(activeFilter === 'active' || activeFilter === 'pending') && (
        <div className="mb-2 flex flex-col gap-1">
          <div className="text-sm text-blue-200 bg-blue-900/40 rounded-lg px-3 py-1">
            Invested: <span className="font-bold text-blue-400">{formatUSDC(invested)} USDC</span>
          </div>
          <div className="text-sm text-purple-200 bg-purple-900/40 rounded-lg px-3 py-1">
            Potential Profit: <span className="font-bold text-purple-400">{formatUSDC(profit)} USDC</span>
          </div>
        </div>
      )}
      {/* Settle Time Info */}
      {(activeFilter === 'active' || activeFilter === 'pending') && (
        <div className="mb-2 p-2 bg-purple-900/20 border border-purple-700/30 rounded-lg">
          <div className="text-center text-xs">
            <div className="text-purple-300 font-medium">{getSettleTimeMsg(contest.dayNumber)}</div>
          </div>
        </div>
      )}
      {/* Cancel Button for Active Contests Created by User */}
      {canCancel && (
        <div className="mt-2 flex justify-end">
          <Button
            onClick={() => onCancel(contest.id)}
            disabled={isCancelling || isCancelLoading}
            variant="danger"
            size="sm"
            loading={isCancelling || isCancelLoading}
          >
            {isCancelling ? 'Cancelling...' : isCancelLoading ? 'Processing...' : 'Cancel Contest'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserContestCard; 