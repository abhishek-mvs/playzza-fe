'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../app/constants'
import { useApproveToken } from '../hooks/useApproveToken'
import { Button } from './ui/Button'
import { formatUSDC, calculateJoinAmount, calculatePotentialProfit, formatOdds, formatTimeRemaining } from '@/utils/formatters'
import CountdownTimer from './CountdownTimer'


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
        
        {contest.creator !== address && contest.opponent === '0x0000000000000000000000000000000000000000' && (
          <div className="mt-auto">
            <Button
              onClick={() => handleJoinContest(contestIndex, joinAmount)}
              disabled={isJoinLoading || isApproving || joiningContestId === contestIndex}
              variant="primary"
              size="md"
              loading={joiningContestId === contestIndex}
              className="w-full"
            >
              {joiningContestId === contestIndex ? 'Joining...' : `Join Contest - ${formatUSDC(joinAmount)} USDC`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 