'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../app/constants'
import { useApproveToken } from '../hooks/useApproveToken'
import { Button } from './ui/Button'
import { formatUSDC, calculateJoinAmount, calculatePotentialProfit, formatOdds } from '@/utils/formatters'

// Utility function to format time remaining
const formatTimeRemaining = (expiryTimestamp: bigint): string => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const timeRemaining = Number(expiryTimestamp - now);
  
  if (timeRemaining <= 0) {
    return 'Expired';
  }
  
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Countdown component
const CountdownTimer = ({ expiryTimestamp }: { expiryTimestamp: bigint }) => {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(expiryTimestamp));
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const remaining = Number(expiryTimestamp - now);
      
      if (remaining <= 0) {
        setTimeRemaining('Expired');
        setIsExpired(true);
        clearInterval(timer);
      } else {
        setTimeRemaining(formatTimeRemaining(expiryTimestamp));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTimestamp]);

  return (
    <div className={`text-sm font-medium px-2 py-1 rounded-full ${
      isExpired 
        ? 'bg-red-500 bg-opacity-20 text-red-400' 
        : timeRemaining.includes('h') 
          ? 'bg-green-500 bg-opacity-20 text-white-400'
          : timeRemaining.includes('m') && parseInt(timeRemaining.split('m')[0]) > 5
            ? 'bg-yellow-500 bg-opacity-20 text-white-400'
            : 'bg-red-500 bg-opacity-20 text-white-400'
    }`}>
      ⏰ {timeRemaining}
    </div>
  );
};

interface Contest {
  statement: string;
  creator: string;
  stake: bigint;
  odds: bigint;
  contestExpiry: bigint;
  opponent: string;
}

interface ContestCardProps {
  contest: Contest;
  contestIndex: number;
  onContestJoined: () => void;
}

export const ContestCard = ({ contest, contestIndex, onContestJoined }: ContestCardProps) => {
  const { address } = useAccount()
  const [joiningContestId, setJoiningContestId] = useState<number | null>(null)

  const { writeContract: writeJoin, data: joinHash } = useWriteContract()
  const { isLoading: isJoinLoading, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinHash,
  })

  const { approve, isApproving, isApproved } = useApproveToken()

  const handleJoinContest = async (contestId: number, stakeAmount: bigint) => {
    if (!address) {
      alert('Please connect your wallet')
      return
    }

    try {
      setJoiningContestId(contestId)
      await approve(stakeAmount)
      
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
      })
    } catch (error) {
      console.error('Error joining contest:', error)
      alert('Error joining contest. Please try again.')
      setJoiningContestId(null)
    }
  }

  useEffect(() => {
    if (isJoinSuccess) {
      onContestJoined()
      setJoiningContestId(null)
    }
  }, [isJoinSuccess, onContestJoined])

  // Calculate amounts for display
  const joinAmount = calculateJoinAmount(contest.stake, contest.odds);
  const potentialProfit = calculatePotentialProfit(contest.stake);
  const oddsDisplay = formatOdds(contest.odds);
  
  return (
    <div className="bg-gradient-to-br from-blue-950/80 to-purple-900/80 p-6 rounded-2xl border border-gray-700 border-opacity-40 shadow-xl flex flex-col w-80 min-h-[320px]">
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="text-lg font-bold text-green-400">
            {formatUSDC(contest.stake)} USDC
          </div>
          <CountdownTimer expiryTimestamp={contest.contestExpiry} />
        </div>
        <div className="flex-1 mb-4">
          <h3 className="text-lg font-semibold text-blue-300 mb-2 line-clamp-2 break-words overflow-hidden">"{contest.statement}"</h3>
          <p className="text-sm text-gray-400">
            Creator: {contest.creator === address ? "You" : `${contest.creator.slice(0, 6)}...${contest.creator.slice(-4)}`}
          </p>
        </div>

        {/* Contest Details Section */}
        <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700/30 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-400 mb-1">Odds Ratio</div>
              <div className="text-yellow-400 font-semibold">{oddsDisplay}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-1">To Join</div>
              <div className="text-orange-400 font-semibold">{formatUSDC(joinAmount)} USDC</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-1">Profit</div>
              <div className="text-green-400 font-semibold">{formatUSDC(potentialProfit)} USDC</div>
            </div>
          </div>
        </div>
      </div>

      {contest.creator !== address && contest.opponent === '0x0000000000000000000000000000000000000000' && (
        <div className="mt-auto">
          <Button
            onClick={() => handleJoinContest(contestIndex, joinAmount)}
            disabled={isJoinLoading || isApproving || joiningContestId === contestIndex}
            variant="primary"
            size="lg"
            loading={joiningContestId === contestIndex}
            className="w-full"
          >
            {joiningContestId === contestIndex ? 'Joining...' : `Join Contest - ${formatUSDC(joinAmount)} USDC`}
          </Button>
        </div>
      )}
    </div>
  );
}; 