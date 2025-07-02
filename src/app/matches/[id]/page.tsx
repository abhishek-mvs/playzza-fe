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
    <div className="relative">
      <LiveContests onBack={handleBack} />
      <Scorecard matchId={matchId} />
    </div>
  )
}
