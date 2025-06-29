'use client'

import { useParams, useRouter } from 'next/navigation'
import Scorecard from '../../../components/Scorecard'
import LiveContests from './LiveContests'

export default function MatchPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string

  const handleBack = () => {
    router.back()
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
        </div>
      </div>
      <LiveContests />
      <Scorecard matchId={matchId} />
    </div>
  )
}
