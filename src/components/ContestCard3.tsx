'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { CONTRACT_ADDRESSES } from '../app/constants'
import { useApproveToken } from '../hooks/useApproveToken'
import { Button } from './ui/Button'
import { formatUSDC, calculateJoinAmount, calculatePotentialProfit, formatOdds } from '@/utils/formatters'
import { ConnectButton } from './ConnectButton'
import CountdownTimer from './CountdownTimer'

interface ContestCard3Props {
  contest: {
    id: string
    statement: string
    creator: string
    opponent: string
    stake: bigint
    odds: bigint
    active: boolean
    contestExpiry: bigint
  }
  onContestJoined?: () => void
}

export default function ContestCard3({
  contest,
  onContestJoined
}: ContestCard3Props) {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const [joiningContest, setJoiningContest] = useState(false)
  
  const { writeContract: writeJoin, data: joinHash } = useWriteContract()
  const { isLoading: isJoinLoading, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinHash,
  })
  
  const { approve, isApproving, isApproved } = useApproveToken()

  const handleBack = () => {
    router.back()
  }

  const handleJoinContest = async () => {
    if (!address) {
      alert('Please connect your wallet')
      return
    }

    if (!contest) {
      alert('Contest not found')
      return
    }

    try {
      setJoiningContest(true)
      
      const joinAmount = calculateJoinAmount(contest.stake, contest.odds)
      
      // If not approved, approve first
      if (!isApproved) {
        await approve(joinAmount)
      }
      
      // Then join the contest
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
        args: [BigInt(contest.id), joinAmount],
      })
    } catch (error) {
      console.error('Error joining contest:', error)
      alert('Error joining contest. Please try again.')
      setJoiningContest(false)
    }
  }

  useEffect(() => {
    if (isJoinSuccess) {
      setJoiningContest(false)
      alert('Successfully joined the contest!')
      onContestJoined?.()
    }
  }, [isJoinSuccess, onContestJoined])

  // Calculate amounts for display
  const joinAmount = calculateJoinAmount(contest.stake, contest.odds)
  const potentialProfit = calculatePotentialProfit(contest.stake)
  const oddsDisplay = formatOdds(contest.odds)
  const isCreator = contest.creator === address
  const hasOpponent = contest.opponent !== '0x0000000000000000000000000000000000000000'

  return (
    <div className="glass rounded-2xl p-8">
      <div className="flex justify-between items-start mb-6">
        <Button 
          onClick={handleBack}
          variant="secondary"
          size="sm"
          className="px-3 py-2"
        >
          ← Back
        </Button>
        <CountdownTimer expiryTimestamp={contest.contestExpiry} size="md" />
      </div>

      {/* Contest Statement */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">Prediction Statement</h3>
        <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-4">
          <p className="text-white text-lg italic">"{contest.statement}"</p>
        </div>
      </div>

      {/* Contest Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Creator</div>
          <div className="text-white font-medium">
            {isCreator ? "You" : `${contest.creator.slice(0, 6)}...${contest.creator.slice(-4)}`}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Opponent</div>
          <div className="text-white font-medium">
            {hasOpponent 
              ? (contest.opponent === address ? "You" : `${contest.opponent.slice(0, 6)}...${contest.opponent.slice(-4)}`)
              : "None"
            }
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Stake Amount</div>
          <div className="text-green-400 font-bold text-lg">{formatUSDC(contest.stake)} USDC</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Odds</div>
          <div className="text-yellow-400 font-bold text-lg">{oddsDisplay}</div>
        </div>
      </div>

      {/* Join Details */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/30 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Join This Contest</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-sm mb-1">Required Stake</div>
            <div className="text-orange-400 font-bold">{formatUSDC(joinAmount)} USDC</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Potential Profit</div>
            <div className="text-green-400 font-bold">{formatUSDC(potentialProfit)} USDC</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Status</div>
            <div className={`font-bold ${contest.active ? 'text-green-400' : 'text-red-400'}`}>
              {contest.active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Join Button */}
      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-400 mb-4">Connect your wallet to join this contest</p>
          <ConnectButton />
        </div>
      ) : isCreator ? (
        <div className="text-center">
          <p className="text-blue-400 mb-4">You created this contest</p>
          <Button variant="secondary" disabled>
            Cannot join your own contest
          </Button>
        </div>
      ) : hasOpponent ? (
        <div className="text-center">
          <p className="text-yellow-400 mb-4">This contest already has an opponent</p>
          <Button variant="secondary" disabled>
            Contest Full
          </Button>
        </div>
      ) : !contest.active ? (
        <div className="text-center">
          <p className="text-red-400 mb-4">This contest is no longer active</p>
          <Button variant="secondary" disabled>
            Contest Inactive
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Button 
            onClick={handleJoinContest}
            variant="success"
            size="lg"
            className="w-full"
            loading={joiningContest || isJoinLoading || isApproving}
            disabled={joiningContest || isJoinLoading || isApproving}
          >
            {joiningContest || isJoinLoading || isApproving 
              ? (isApproving ? 'Approving...' : 'Joining Contest...') 
              : `Join Contest for ${formatUSDC(joinAmount)} USDC`
            }
          </Button>
        </div>
      )}
    </div>
  )
} 