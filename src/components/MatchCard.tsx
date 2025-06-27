'use client'

import { useRouter } from 'next/navigation'
import { MatchInfo } from '../types/match'

interface MatchCardProps {
  match: MatchInfo
}

export default function MatchCard({ match }: MatchCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/matches/${match.matchId}`)
  }

  return (
    <li 
      className="border p-4 rounded shadow hover:shadow-md transition-shadow cursor-pointer bg-white hover:bg-gray-50"
      onClick={handleClick}
    >
      <h2 className="text-xl font-semibold text-center">{match.matchDesc} ({match.matchFormat})</h2>
      <p className="text-gray-700 text-center">
        {match.team1.teamName} vs {match.team2.teamName}
      </p>
      <p className="text-sm text-blue-600 text-center">{match.status}</p>
      <p className="text-sm text-green-600 text-center">{match.state}</p>
    </li>
  )
} 