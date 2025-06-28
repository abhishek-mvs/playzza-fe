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
    <div 
      className="glass rounded-xl p-6 hover:bg-white hover:bg-opacity-10 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 hover:shadow-xl"
      onClick={handleClick}
    >
      <h3 className="text-lg font-bold text-white mb-3 text-center group-hover:text-blue-300 transition-colors duration-300">
        {match.matchDesc}
      </h3>
      <div className="text-center mb-4">
        <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
          {match.matchFormat}
        </span>
      </div>
      <p className="text-gray-300 text-center mb-3 font-medium">
        {match.team1.teamName} <span className="text-gray-500">vs</span> {match.team2.teamName}
      </p>
      <div className="text-center space-y-2">
        <p className="text-sm text-blue-400 bg-blue-900 bg-opacity-20 px-3 py-1 rounded">
          {match.status}
        </p>
        <p className="text-sm text-green-400 bg-green-900 bg-opacity-20 px-3 py-1 rounded">
          {match.state}
        </p>
      </div>
    </div>
  )
} 