'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useJoinContest } from '../hooks/useJoinContest'
import { useCancelContest } from '../hooks/useCancelContest'
import { Button } from './ui/Button'
import { formatUSDC, calculateJoinAmount, calculatePotentialProfit, formatOdds } from '@/utils/formatters'
import { CardConnectButton } from './ConnectButton'
import CountdownTimer from './CountdownTimer'
import { useContestsByMatchId } from '../hooks/useContests'
import type { Contest } from '@/types/contest'
import { ContestCard2 } from './ContestCard2'
import { getSettleTimeMsg } from '@/utils/utils'

interface ContestCard3Props {
  contest: Contest
  onContestJoined?: () => void
  onContestCancelled?: () => void
}

export default function ContestCard3({
  contest,
  onContestJoined,
  onContestCancelled
}: ContestCard3Props) {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const [sharing, setSharing] = useState(false)
  
  const { 
    handleJoinContest, 
    joiningContestId, 
    joiningContest, 
    isJoinLoading, 
    approving, 
    isJoinSuccess, 
    usdcBalance, 
    isBalanceLoading,
    error: joinError,
    clearError: clearJoinError,
    currentStep: joinCurrentStep
  } = useJoinContest()

  const { 
    handleCancelContest, 
    cancellingContestId, 
    cancellingContest, 
    isCancelLoading, 
    isCancelSuccess,
    error: cancelError,
    clearError: clearCancelError
  } = useCancelContest()

  // Fetch other active contests for this match
  const { contests: otherContests, isLoading: isOtherLoading } = useContestsByMatchId(contest.matchId)
  // Filter out the current contest
  const filteredContests = (otherContests || []).filter(c => c.id !== contest.id)

  // Determine contest state
  const now = BigInt(Math.floor(Date.now() / 1000))
  const isExpired = contest.active && contest.contestExpiry < now
  const isActive = contest.active && contest.contestExpiry >= now
  const isPending = !contest.active && !contest.settled
  const isCompleted = !contest.active && contest.settled && !contest.cancelled
  const isCancelled = !contest.active && contest.settled && contest.cancelled

  // User roles
  const isCreator = contest.creator === address
  const isOpponent = contest.opponent === address
  const hasOpponent = contest.opponent !== '0x0000000000000000000000000000000000000000'

  const handleBack = () => {
    router.back()
  }

  const handleShare = async () => {
    try {
      setSharing(true)
      
      const shareUrl = `${window.location.origin}/contest/${contest.id}`
      const shareText = `Come join my playzza contest: "${contest.statement}" - Stake: ${formatUSDC(contest.stake)} USDC, Odds: ${formatOdds(contest.odds)}`
      
      // Try to use Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: 'Playzza Contest',
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

  useEffect(() => {
    if (isJoinSuccess) {
      console.log('Successfully joined the contest!')
      alert('Successfully joined the contest!')
      onContestJoined?.()
    }
  }, [isJoinSuccess, onContestJoined])

  useEffect(() => {
    if (isCancelSuccess) {
      // Use a more user-friendly notification instead of alert
      console.log('Successfully cancelled the contest!')
      onContestCancelled?.()
    }
  }, [isCancelSuccess, onContestCancelled])

  // Handle cancel errors
  useEffect(() => {
    if (cancelError) {
      console.error('Cancel contest error:', cancelError)
    }
  }, [cancelError])

  // Handle join errors
  useEffect(() => {
    if (joinError) {
      console.error('Join contest error:', joinError)
    }
  }, [joinError])

  // Calculate amounts for display
  const joinAmount = calculateJoinAmount(contest.stake, contest.odds)
  const potentialProfit = calculatePotentialProfit(contest.stake)
  const oddsDisplay = formatOdds(contest.odds)
  
  // Check if user has sufficient balance
  const hasSufficientBalance = usdcBalance >= joinAmount

  // Render status badge
  const renderStatusBadge = () => {
    if (isCancelled) {
      return <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm font-medium">Cancelled</div>
    } else if (isCompleted) {
      return <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">Completed</div>
    } else if (isExpired) {
      return <div className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">Expired</div>
    } else if (isPending) {
      return <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">Pending</div>
    } else if (isActive) {
      return <div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">Active</div>
    }
    return null
  }

  // Render timer or status
  const renderTimerOrStatus = () => {
    if (isCancelled) {
      return <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm font-medium">Cancelled</div>
    } else if (isCompleted) {
      return <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">Completed</div>
    } else if (isExpired) {
      return <div className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">Expired</div>
    } else if (isPending) {
      return <CountdownTimer expiryTimestamp={contest.settleTime} size="md" showResults={hasOpponent} />
    } else if (isActive) {
      return <CountdownTimer expiryTimestamp={contest.contestExpiry} size="md" />
    }
    return null
  }

  // Render winner information for completed contests
  const renderWinnerInfo = () => {
    if (!isCompleted) return null

    const winner = contest.verdict ? contest.creator : contest.opponent
    const isUserWinner = winner === address
    const profitAmount = contest.verdict ? contest.opponentStake : contest.stake

    return (
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/30 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">🏆 Contest Results</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-sm mb-1">Winner</div>
            <div className="text-green-400 font-bold">
              {isUserWinner ? "You" : `${winner.slice(0, 6)}...${winner.slice(-4)}`}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Profit Earned</div>
            <div className="text-green-400 font-bold">{formatUSDC(profitAmount)} USDC</div>
          </div>
        </div>
      </div>
    )
  }

  // Render action buttons based on contest state and user role
  const renderActionButtons = () => {
    if (isCancelled || isCompleted || isExpired) {
      return (
        <div className="text-center">
          {isCompleted && contest.verdictReason && (
            <div className="mb-4 bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-3 text-left w-full">
              <span className="font-semibold text-indigo-300">Verdict Reason: </span>
              <span className="text-gray-200">{contest.verdictReason}</span>
            </div>
          )}
          <Button variant="secondary" disabled>
            {isCancelled ? 'Contest Cancelled' : isCompleted ? 'Contest Completed' : 'Contest Expired'}
          </Button>
        </div>
      )
    }

    if (!isConnected) {
      return (
        <div className="text-center">
          <CardConnectButton />
        </div>
      )
    }

    if (isActive) {
      if (isCreator) {
        return (
          <div className="space-y-3">
            <Button 
              onClick={() => handleCancelContest(contest.id)}
              variant="danger"
              size="lg"
              className="w-full"
              loading={cancellingContest}
              disabled={cancellingContest}
            >
              {cancellingContest ? 'Cancelling Contest...' : 'Cancel Contest'}
            </Button>
          </div>
        )
      } else if (hasOpponent) {
        return (
          <div className="text-center">
            <Button variant="secondary" disabled>
              Contest Full
            </Button>
          </div>
        )
      } else {
        return (
          <div className="space-y-3">
            <Button 
              onClick={() => handleJoinContest(contest.id, contest.stake, contest.odds)}
              variant="success"
              size="lg"
              className="w-full"
              loading={joiningContest}
              disabled={joiningContest || !hasSufficientBalance || isBalanceLoading}
            >
              {joiningContest 
                ? (joinCurrentStep === 'approving' ? 'Approving Tokens...' : 'Joining Contest...') 
                : (address && !hasSufficientBalance) ? 'Insufficient Balance' :
                `Join Contest for ${formatUSDC(joinAmount)} USDC`
              }
            </Button>
          </div>
        )
      }
    }

    if (isPending) {
      return (
        <div className="text-center">
          <Button variant="secondary" disabled>
            Contest Full - Waiting for Results
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="glass rounded-2xl p-8 h-full flex flex-col overflow-y-auto">
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
        <div className="flex items-center gap-3">
          {/* {renderStatusBadge()} */}
          {renderTimerOrStatus()}
        </div>
      </div>

      <div className="flex-1">
        {/* Contest Statement */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">Prediction Statement</h3>
          <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-4">
            <p className="text-white text-lg italic">"{contest.statement}"</p>
          </div>
        </div>

        {/* Winner Information for Completed Contests */}
        {renderWinnerInfo()}

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
                ? (isOpponent ? "You" : `${contest.opponent.slice(0, 6)}...${contest.opponent.slice(-4)}`)
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

        {/* Join Details - Only show for active contests */}
        {isActive && !hasOpponent && (
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
                <div className="text-green-400 font-bold">Active</div>
              </div>
            </div>
          </div>
        )}

         {/* Settle Time Info */}
         <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-2 mb-4">
          <div className="text-center">
            <div className="text-purple-300 font-medium text-sm">{getSettleTimeMsg(contest.dayNumber)}</div>
          </div>
        </div>

        {/* Action Buttons */}
        {renderActionButtons()}

        {/* Error Display */}
        {cancelError && (
          <div className="mt-4 bg-red-900/30 border border-red-700/30 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-red-400 font-semibold mb-2">Error Cancelling Contest</h4>
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

        {/* Join Error Display */}
        {joinError && (
          <div className="mt-4 bg-red-900/30 border border-red-700/30 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-red-400 font-semibold mb-2">Error Joining Contest</h4>
              </div>
              <button
                onClick={clearJoinError}
                className="ml-4 text-red-400 hover:text-red-300 text-sm font-medium"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isCancelSuccess && (
          <div className="mt-4 bg-green-900/30 border border-green-700/30 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-400 mr-3">✓</div>
              <div>
                <h4 className="text-green-400 font-semibold">Contest Cancelled Successfully!</h4>
                <p className="text-green-300 text-sm">Your stake has been returned to your wallet.</p>
              </div>
            </div>
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
    </div>
  )
} 