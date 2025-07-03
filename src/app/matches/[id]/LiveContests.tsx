'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useContestsByMatchId } from '../../../hooks/useContests'
import { CreateContest } from '../../../components/CreateContest'
import { ContestCard } from '../../../components/ContestCard'
import { Button } from '../../../components/ui/Button'

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

  return (
    <div className="p-4 max-w-6xl mx-auto">
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
        <div className="overflow-x-auto scrollbar-hide py-2">
          <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
            {contests.map((contest, index) => (
              <ContestCard
                key={index}
                contest={contest}
                contestIndex={index}
                onContestJoined={handleContestJoined}
              />
            ))}
          </div>
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