'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

import { useJoinContest } from '../hooks/useJoinContest'
import { Button } from './ui/Button'
import { formatUSDC, calculateJoinAmount, calculatePotentialProfit, formatOdds, formatTimeRemaining } from '@/utils/formatters'
import CountdownTimer from './CountdownTimer'
import { Contest } from '@/types/contest'
import { getSettleTimeMsg } from '@/utils/utils'

interface ContestCardProps {
  contest: Contest;
  contestIndex: number;
  onContestJoined: () => void;
}

export const ContestCard = ({ contest, contestIndex, onContestJoined }: ContestCardProps) => {
  const { address } = useAccount()
  
  const { 
    handleJoinContest, 
    joiningContestId, 
    joiningContest, 
    isJoinLoading, 
    isApproving, 
    isJoinSuccess, 
    usdcBalance, 
    isBalanceLoading,
    error: joinError,
    clearError: clearJoinError,
    currentStep: joinCurrentStep
  } = useJoinContest()

  useEffect(() => {
    if (isJoinSuccess) {
      onContestJoined()
    }
  }, [isJoinSuccess, onContestJoined])

  // Calculate amounts for display
  const joinAmount = calculateJoinAmount(contest.stake, contest.odds);
  const potentialProfit = calculatePotentialProfit(contest.stake);
  const oddsDisplay = formatOdds(contest.odds);
  
  // Check if user has sufficient balance
  const hasSufficientBalance = usdcBalance >= joinAmount;
  
  return (
    <div className="bg-gradient-to-br from-blue-950/80 to-purple-900/80 p-6 rounded-2xl border border-gray-700 border-opacity-40 shadow-xl flex flex-col w-80 min-h-[320px]">
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="text-lg font-bold text-green-400">
            {formatUSDC(contest.stake)} USDC
          </div>
          <CountdownTimer expiryTimestamp={contest.contestExpiry} size="sm" />
        </div>
        <div className="flex-1 mb-4">
          <h3 className="text-lg font-semibold text-blue-300 mb-2 line-clamp-2 break-words overflow-hidden">"{contest.statement}"</h3>
          <p className="text-sm text-gray-400">
            Creator: {contest.creator === address ? "You" : `${contest.creator.slice(0, 6)}...${contest.creator.slice(-4)}`}
          </p>
        </div>

        {/* Contest Details Section */}
        <div className="mb-3 p-2 bg-blue-900/30 border border-blue-700/30 rounded-lg">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-400 mb-0.5">Odds</div>
              <div className="text-yellow-400 font-semibold">{oddsDisplay}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-0.5">To Join</div>
              <div className="text-orange-400 font-semibold">{formatUSDC(joinAmount)} USDC</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-0.5">Profit</div>
              <div className="text-green-400 font-semibold">{formatUSDC(potentialProfit)} USDC</div>
            </div>
          </div>
        </div>

        {/* Settle Time Info */}
        <div className="mb-3 p-2 bg-purple-900/20 border border-purple-700/30 rounded-lg">
          <div className="text-center text-xs">
            <div className="text-purple-300 font-medium">{getSettleTimeMsg(contest.dayNumber)}</div>
          </div>
        </div>

        {/* Error Display */}
        {joinError && (
          <div className="mb-3 bg-red-900/30 border border-red-700/30 rounded-lg p-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-red-300 text-xs">{joinError}</p>
              </div>
              <button
                onClick={clearJoinError}
                className="ml-2 text-red-400 hover:text-red-300 text-xs font-medium"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {contest.creator !== address && contest.opponent === '0x0000000000000000000000000000000000000000' && (
          <div className="mt-auto">
            <Button
              onClick={() => handleJoinContest(contest.id, contest.stake, contest.odds)}
              disabled={joiningContest || !hasSufficientBalance || isBalanceLoading}
              variant="primary"
              size="md"
              loading={joiningContest}
              className="w-full"
            >
              {joiningContest ? (
                joinCurrentStep === 'approving' ? 'Approving Tokens...' : 'Joining Contest...'
              ) : 
               (address && !hasSufficientBalance) ? 'Insufficient Balance' :
               `Join Contest - ${formatUSDC(joinAmount)} USDC`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 