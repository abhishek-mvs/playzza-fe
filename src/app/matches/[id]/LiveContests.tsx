'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { useContestsByMatchId } from '../../../hooks/useContests'
import { useApproveToken } from '../../../hooks/useApproveToken'
import { CONTRACT_ADDRESSES } from '../../../app/constants'
import { CreateContest } from '../../../components/CreateContest'
import { Button } from '../../../components/ui/Button'
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

export default function LiveContests() {
  const params = useParams()
  const matchId = params.id as string
  const { address } = useAccount()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [joiningContestId, setJoiningContestId] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(6); // Show 6 contests by default
  const CONTESTS_PER_ROW = 3;

  const { contests, isLoading, refetch } = useContestsByMatchId(matchId)

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

  const handleContestCreated = () => {
    setShowCreateForm(false)
    refetch()
  }

  useEffect(() => {
    if (isJoinSuccess) {
      refetch()
      setJoiningContestId(null)
    }
  }, [isJoinSuccess, refetch])

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Live Contests</h1>
        <Button
          onClick={() => setShowCreateForm(true)}
          variant="success"
          size="md"
        >
          Create Contest
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading contests...</p>
        </div>
      ) : !contests || contests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-gray-400 text-lg mb-4">No active contests for this match.</p>
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="success"
            size="md"
          >
            Create First Contest
          </Button>
        </div>
      ) : (
        <div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {contests.slice(0, visibleCount).map((contest, index) => {
              // Calculate amounts for display
              const joinAmount = calculateJoinAmount(contest.stake, contest.odds);
              const potentialProfit = calculatePotentialProfit(contest.stake);
              const oddsDisplay = formatOdds(contest.odds);
              
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-950/80 to-purple-900/80 p-6 rounded-2xl border border-gray-700 border-opacity-40 shadow-xl transition-transform hover:scale-[1.025] hover:shadow-2xl flex flex-col justify-between min-h-[320px]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-300 mb-2">"{contest.statement}"</h3>
                      <p className="text-sm text-gray-400 mt-2">
                        Creator: {contest.creator === address ? "You" : `${contest.creator.slice(0, 6)}...${contest.creator.slice(-4)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400 mb-2">
                        {formatUSDC(contest.stake)} USDC
                      </div>
                      <CountdownTimer expiryTimestamp={contest.contestExpiry} />
                    </div>
                  </div>

                  {/* Contest Details Section */}
                  <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700/30 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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

                  {contest.creator !== address && contest.opponent === '0x0000000000000000000000000000000000000000' && (
                    <div className="mt-auto">
                      <Button
                        onClick={() => handleJoinContest(index, joinAmount)}
                        disabled={isJoinLoading || isApproving || joiningContestId === index}
                        variant="primary"
                        size="lg"
                        loading={joiningContestId === index}
                        className="w-full"
                      >
                        {joiningContestId === index ? 'Joining...' : `Join Contest - ${formatUSDC(joinAmount)} USDC`}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {contests.length > visibleCount && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                variant="secondary"
                size="md"
                className="px-8 py-2 rounded-full shadow-lg bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-600 hover:to-purple-600"
              >
                Show More
              </Button>
            </div>
          )}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="glass rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-500 border-opacity-30">
            <div className="flex justify-between items-center p-4 border-b border-gray-500 border-opacity-30">
              <h2 className="text-xl font-semibold text-white">Create Prediction Contest</h2>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ×
              </Button>
            </div>
            
            <div className="p-6">
              <CreateContest 
                onContestCreated={handleContestCreated}
                matchId={matchId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}