'use client'

import { useRouter } from 'next/navigation'
import { MatchInfo } from '../types/match'
import { useContestStatsByMatchId } from '../hooks/useContests'
import { Card, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import Loading from './ui/Loading'

interface MatchCardProps {
  match: MatchInfo
}

export default function MatchCard({ match }: MatchCardProps) {
  const router = useRouter()
  const { stats, isLoading } = useContestStatsByMatchId(match.matchId.toString())

  const handleClick = () => {
    router.push(`/matches/${match.matchId}`)
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
      case 'active':
        return 'success'
      case 'completed':
      case 'finished':
        return 'info'
      case 'pending':
      case 'scheduled':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Card 
      variant="glass" 
      hover={true}
      className="cursor-pointer card-hover"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-white mb-3 text-center group-hover:text-blue-300 transition-colors duration-300">
          {match.matchDesc}
        </h3>
        
        <div className="text-center mb-4">
          <Badge variant="secondary" size="sm">
            {match.matchFormat}
          </Badge>
        </div>
        
        <p className="text-gray-300 text-center mb-4 font-medium">
          {match.team1.teamName} <span className="text-gray-500">vs</span> {match.team2.teamName}
        </p>
        
        <div className="text-center space-y-2 mb-4">
          <Badge variant="secondary" size="sm">
            {match.status}
          </Badge>
        </div>

        <div className="text-center space-y-2 mb-4">
          <Badge variant="secondary" size="sm">
            {match.state}
          </Badge>
        </div>
        
        <div className="border-t border-gray-700 pt-4">
          {isLoading ? (
            <Loading size="sm" text="Loading stats..." />
          ) : stats ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="status-active rounded-lg p-3">
                <div className="text-green-400 text-lg font-bold">{stats.active}</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
              <div className="status-pending rounded-lg p-3">
                <div className="text-yellow-400 text-lg font-bold">{stats.decisionPending}</div>
                <div className="text-xs text-gray-400">Pending</div>
              </div>
              <div className="status-completed rounded-lg p-3">
                <div className="text-blue-400 text-lg font-bold">{stats.completed}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm">
              No contests yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 