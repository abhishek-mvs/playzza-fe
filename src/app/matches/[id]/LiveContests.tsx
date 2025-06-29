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

export default function LiveContests() {
  const params = useParams()
  const matchId = params.id as string
  const { address } = useAccount()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [joiningContestId, setJoiningContestId] = useState<number | null>(null)

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
    <div className="p-4">
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
        <div className="space-y-4">
          {contests.map((contest, index) => (
            <div key={index} className="glass p-6 rounded-xl border border-gray-500 border-opacity-30">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{contest.title}</h3>
                  <p className="text-gray-300 text-sm mb-2">{contest.details}</p>
                  <p className="text-blue-300 text-sm font-medium">"{contest.statement}"</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Creator: {contest.creator.slice(0, 6)}...{contest.creator.slice(-4)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400 mb-2">
                    {formatUnits(contest.stake, 6)} USDC
                  </div>
                  <div className="bg-green-500 bg-opacity-20 text-green-400 text-sm px-2 py-1 rounded-full">
                    Active
                  </div>
                </div>
              </div>

              {contest.creator !== address && contest.opponent === '0x0000000000000000000000000000000000000000' && (
                <div className="mt-4">
                  <Button
                    onClick={() => handleJoinContest(index, contest.stake)}
                    disabled={isJoinLoading || isApproving || joiningContestId === index}
                    variant="primary"
                    size="lg"
                    loading={joiningContestId === index}
                    className="w-full"
                  >
                    {joiningContestId === index ? 'Joining...' : `Join Contest - ${formatUnits(contest.stake, 6)} USDC`}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="glass rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-500 border-opacity-30">
            <div className="flex justify-between items-center p-6 border-b border-gray-500 border-opacity-30">
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