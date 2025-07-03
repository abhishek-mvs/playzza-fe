'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState, useEffect } from 'react'
import { CONTRACT_ADDRESSES } from '../../constants'
import { useContestById } from '../../../hooks/useContests'
import { useApproveToken } from '../../../hooks/useApproveToken'
import { Button } from '../../../components/ui/Button'
import Scorecard from '../../../components/Scorecard'
import { formatUSDC, calculateJoinAmount, calculatePotentialProfit, formatOdds, formatTimeRemaining } from '@/utils/formatters'
import { ConnectButton } from '../../../components/ConnectButton'
import CountdownTimer from '../../../components/CountdownTimer'

export default function ContestPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const contestId = params.id as string
  
  const { contest, isLoading, refetch } = useContestById(contestId)
  const [joiningContest, setJoiningContest] = useState(false)
  
  const { writeContract: writeJoin, data: joinHash } = useWriteContract()
  const { isLoading: isJoinLoading, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinHash,
  })
  
  const { approve, isApproving, isApproved } = useApproveToken()

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
        args: [BigInt(contestId), joinAmount],
      })
    } catch (error) {
      console.error('Error joining contest:', error)
      alert('Error joining contest. Please try again.')
      setJoiningContest(false)
    }
  }

  const handleApprove = async () => {
    if (!contest) return
    
    const joinAmount = calculateJoinAmount(contest.stake, contest.odds)
    await approve(joinAmount)
  }

  useEffect(() => {
    if (isJoinSuccess) {
      refetch()
      setJoiningContest(false)
      alert('Successfully joined the contest!')
    }
  }, [isJoinSuccess, refetch])

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <p className="text-gray-400 text-xl">Loading contest details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Contest Not Found</h2>
            <p className="text-gray-400 mb-8">The contest you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBack} variant="primary">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate amounts for display
  const joinAmount = calculateJoinAmount(contest.stake, contest.odds)
  const potentialProfit = calculatePotentialProfit(contest.stake)
  const oddsDisplay = formatOdds(contest.odds)
  const isCreator = contest.creator === address
  const hasOpponent = contest.opponent !== '0x0000000000000000000000000000000000000000'

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={handleBack}
            variant="secondary"
            size="sm"
            className="px-3 py-2"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Contest Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contest Details Section */}
          <div className="glass rounded-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Contest #{contestId}</h2>
              <CountdownTimer expiryTimestamp={contest.contestExpiry} size="lg" />
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
                {!isApproved ? (
                  <Button 
                    onClick={handleApprove}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={isApproving}
                  >
                    {isApproving ? 'Approving...' : `Approve ${formatUSDC(joinAmount)} USDC`}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleJoinContest}
                    variant="success"
                    size="lg"
                    className="w-full"
                    loading={joiningContest || isJoinLoading}
                  >
                    {joiningContest || isJoinLoading ? 'Joining Contest...' : `Join Contest for ${formatUSDC(joinAmount)} USDC`}
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-lg">
            <Scorecard matchId={contest.matchId} />
          </div>
        </div>
      </div>
    </div>
  )
}
