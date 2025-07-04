'use client'

import { useParams, useRouter } from 'next/navigation'
import Scorecard from '../../../components/Scorecard'
import LiveContests from './LiveContests'
import { Button } from '../../../components/ui/Button'

export default function MatchPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
    <div className="grid grid-cols-1 gap-1">
      <div>
        <LiveContests onBack={handleBack} />
      </div>
      <div>
        <Scorecard matchId={matchId} />
        </div>
      </div>
    </div>
  )
}
