'use client'

import { useParams, useRouter } from 'next/navigation'
import Scorecard from '../../../components/Scorecard'

export default function MatchPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string

  const handleBack = () => {
    router.back()
  }

  return (
    <div>
      <div className="p-4">
        <button 
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          ← Back
        </button>
      </div>
      <Scorecard matchId={matchId} />
    </div>
  )
}
