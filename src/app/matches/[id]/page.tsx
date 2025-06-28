'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Scorecard from '../../../components/Scorecard'
import { CreateContest } from '../../../components/CreateContest'

export default function MatchPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string
  const [showContestForm, setShowContestForm] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const handleContestCreated = () => {
    setShowContestForm(false)
    // You can add additional logic here, like refreshing the page or showing a success message
  }

  const closeModal = () => {
    setShowContestForm(false)
  }

  return (
    <div className="relative">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
          
          <button
            onClick={() => setShowContestForm(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Create Contest for This Match
          </button>
        </div>
      </div>
      
      <Scorecard matchId={matchId} />

      {/* Modal Overlay */}
      {showContestForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Create Prediction Contest</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            
            {/* Modal Body */}
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
