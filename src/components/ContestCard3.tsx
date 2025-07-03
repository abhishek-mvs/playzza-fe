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
import { useContestsByMatchId } from '../hooks/useContests'
import type { Contest } from '@/types/contest'
import { ContestCard2 } from './ContestCard2'

interface ContestCard3Props {
  contest: Contest
  onContestJoined?: () => void
}

export default function ContestCard3({
  contest,
  onContestJoined
}: ContestCard3Props) {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const [joiningContest, setJoiningContest] = useState(false)
  const [sharing, setSharing] = useState(false)
  
  const { writeContract: writeJoin, data: joinHash } = useWriteContract()
  const { isLoading: isJoinLoading, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinHash,
  })
  
  const { approve, isApproving, isApproved } = useApproveToken()

  // Fetch other active contests for this match
  const { contests: otherContests, isLoading: isOtherLoading } = useContestsByMatchId(contest.matchId)
  // Filter out the current contest
  const filteredContests = (otherContests || []).filter(c => c.id !== contest.id)

  const handleBack = () => {
    router.back()
  }

  const handleShare = async () => {
    try {
      setSharing(true)
      
      const shareUrl = `${window.location.origin}/contest/${contest.id}`
      const shareText = `Check out this prediction contest: "${contest.statement}" - Stake: ${formatUSDC(contest.stake)} USDC, Odds: ${formatOdds(contest.odds)}`
      
      // Try to use Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: 'Prediction Contest',
          text: shareText,
          url: shareUrl,
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
        alert('Contest link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing contest:', error)
      // Final fallback - just copy URL
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/contest/${contest.id}`)
        alert('Contest link copied to clipboard!')
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError)
        alert('Unable to share contest. Please copy the URL manually.')
      }
    } finally {
      setSharing(false)
    }
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
        <div className="flex gap-3">
          <Button 
            onClick={handleBack}
            variant="secondary"
            size="sm"
            className="px-3 py-2"
          >
            ← Back
          </Button>
          <Button 
            onClick={handleShare}
            variant="secondary"
            size="sm"
            className="px-3 py-2"
            loading={sharing}
            disabled={sharing}
          >
            {sharing ? 'Sharing...' : (
              <>
                <img src="/icons/share.png" alt="Share" className="w-4 h-4 mr-2 inline" />
                Share
              </>
            )}
          </Button>
        </div>
        {hasOpponent ? (
          <CountdownTimer expiryTimestamp={contest.settleTime} size="md" showResults={hasOpponent} />
        ) : (
          <CountdownTimer expiryTimestamp={contest.contestExpiry} size="md" />
        )}
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
      {hasOpponent ? (
        <div className="text-center">
          <Button variant="secondary" disabled>
            Contest Full
          </Button>
        </div>
      ) : !isConnected ? (
        <div className="text-center">
          <p className="text-gray-400 mb-4">Connect your wallet to join this contest</p>
          <ConnectButton />
        </div>
      ) : isCreator ? (
        <div className="text-center">
          <Button variant="secondary" disabled>
            Cannot join your own contest
          </Button>
        </div>
      ) : !contest.active ? (
        <div className="text-center">
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

      {/* Other Active Contests for this Match */}
      <div className="mt-10">
        <h4 className="text-lg font-semibold text-white mb-3">Other Active Contests for this Match</h4>
        {isOtherLoading ? (
          <div className="text-center py-4 text-gray-400">Loading other contests...</div>
        ) : filteredContests.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No other active contests for this match.</div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide py-2">
            <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
              {filteredContests.map((c, idx) => (
                <div key={c.id} className="w-80 flex-shrink-0">
                  <div 
                    onClick={() => router.push(`/contests/${c.id}`)}
                    className="cursor-pointer"
                  >
                    <ContestCard2 contest={c} contestIndex={idx} onContestJoined={onContestJoined || (() => {})} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 