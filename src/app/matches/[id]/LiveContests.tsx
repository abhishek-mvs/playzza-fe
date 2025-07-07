'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useContestsByMatchId } from '../../../hooks/useContests'
import { CreateContest } from '../../../components/CreateContest'
import { ContestCard } from '../../../components/ContestCard'
import { Button } from '../../../components/ui/Button'
import { MatchInfoDetailed } from '@/types/match'
import { getApiUrl } from '@/utils/api'

export default function LiveContests({ onBack }: { onBack?: () => void }) {
  const params = useParams()
  const matchId = params.id as string
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { contests, isLoading, refetch } = useContestsByMatchId(matchId)

  const handleContestCreated = () => {
    setShowCreateForm(false)
    refetch()
  }

  const handleContestJoined = () => {
    refetch()
  }

  
  const [matchDetails, setMatchDetails] = useState<MatchInfoDetailed | null>(null)
  const [matchLoading, setMatchLoading] = useState(true)

  const fetchMatchDetails = async () => {
    try {
      const res = await fetch(getApiUrl(`/v1/match/${matchId}`))
      const data = await res.json()
      console.log('data', data)
      setMatchDetails(data)
      setMatchLoading(false)
    } catch (err) {
      console.error('Failed to fetch match details', err)
      setMatchLoading(false)
    }
  }

  // Call once when component mounts
  if (matchLoading && !matchDetails) {
    fetchMatchDetails()
  }

  console.log(matchDetails)

  return (
    <div className="p-4 max-w-8xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button 
              onClick={onBack}
              variant="secondary"
              size="sm"
              className="px-2 py-1 text-xs"
            >
              ←
            </Button>
          )}
          <h1 className="text-xl font-bold text-white">Live Contests</h1>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          variant="success"
          size="sm"
        >
          Create Contest
        </Button>
      </div>

      <div className="glass rounded-xl p-1">
      {isLoading ? (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading contests...</p>
        </div>
      ) : !contests || contests.length === 0 ? (
        <div className="text-center py-6">
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
        <div className="overflow-x-auto scrollbar-hide py-1">
          <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
              {contests.map((contest) => (
              <ContestCard
                key={contest.id}
                contest={contest}
                contestIndex={Number(contest.id)}
                onContestJoined={handleContestJoined}
              />
            ))}
          </div>
        </div>
      )}
      </div>
      {showCreateForm && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/60 backdrop-blur-sm p-4">
          <div className="relative glass rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-500 border-opacity-30 mt-20">
            {/* Sticky Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gray-900/90 border-b border-gray-700 rounded-t-2xl shadow-md">
              <h3 className="text-xl font-bold text-white drop-shadow-sm">Creating contest for Match ID: {matchId}</h3>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="ghost"
                size="lg"
                className="text-gray-400 hover:text-white text-3xl font-extrabold px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Close"
              >
                ×
              </Button>
            </div>
            {/* Modal Content */}
            {matchDetails && (
              <div className="overflow-y-auto p-6">
                <CreateContest 
                  onContestCreated={handleContestCreated}
                  matchId={matchId}
                  matchDetails={matchDetails}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}