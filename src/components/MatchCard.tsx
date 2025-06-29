'use client'

import { useRouter } from 'next/navigation'
import { MatchInfo } from '../types/match'
import { useContestStatsByMatchId } from '../hooks/useContests'

interface MatchCardProps {
  match: MatchInfo
}

export default function MatchCard({ match }: MatchCardProps) {
  const router = useRouter()
  const { stats, isLoading } = useContestStatsByMatchId(match.matchId.toString())

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
      <div className="text-center space-y-2 mb-4">
        <p className="text-sm text-blue-400 bg-blue-900 bg-opacity-20 px-3 py-1 rounded">
          {match.status}
        </p>
        <p className="text-sm text-green-400 bg-green-900 bg-opacity-20 px-3 py-1 rounded">
          {match.state}
        </p>
      </div>
      
      <div className="border-t border-gray-700 pt-4">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        ) : stats? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-900 bg-opacity-20 rounded p-2">
              <div className="text-blue-400 text-lg font-bold">{stats.active}</div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
            <div className="bg-yellow-900 bg-opacity-20 rounded p-2">
              <div className="text-yellow-400 text-lg font-bold">{stats.decisionPending}</div>
              <div className="text-xs text-gray-400">Pending</div>
            </div>
            <div className="bg-green-900 bg-opacity-20 rounded p-2">
              <div className="text-green-400 text-lg font-bold">{stats.completed}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm">
            No contests yet
          </div>
        )}
      </div>
    </div>
  )
} 