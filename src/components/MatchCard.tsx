'use client'

import { useRouter } from 'next/navigation'
import { MatchInfo } from '../types/match'
import { useContestStatsByMatchId } from '../hooks/useContests'
import { Card, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import Loading from './ui/Loading'
import { useEffect, useState } from 'react'
interface MatchCardProps {
  match: MatchInfo
}

export default function MatchCard({ match }: MatchCardProps) {
  const router = useRouter()
  const { stats, isLoading } = useContestStatsByMatchId(match.matchId.toString())
  const [totalContests, setTotalContests] = useState(0)

  const handleClick = () => {
    router.push(`/matches/${match.matchId}`)
  }
  const getTotalContests = () => {
    if (!stats) return 0
    return Number(stats.active || 0) + Number(stats.completed || 0) + Number(stats.decisionPending || 0)
  }

  useEffect(() => {
    setTotalContests(getTotalContests())
  }, [stats])


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
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300 truncate">
              {match.matchDesc}
            </h3>
            
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="secondary" size="sm">
                {match.matchFormat}
              </Badge>
              <Badge variant="secondary" size="sm">
                {match.status}
              </Badge>
              <Badge variant="secondary" size="sm">
                {match.state}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-300 font-medium truncate">
              {match.team1.teamName} <span className="text-gray-500">vs</span> {match.team2.teamName}
            </p>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            {isLoading ? (
              <Loading size="sm" text="Loading stats..." />
            ) : stats ? (
              <div className="flex gap-2">
                <div className="status-active rounded-lg p-2 text-center min-w-[60px]">
                  <div className="text-green-400 text-sm font-bold">{stats.active}</div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
                <div className="status-completed rounded-lg p-2 text-center min-w-[60px]">
                  <div className="text-blue-400 text-sm font-bold">{totalContests}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-xs">
                No contests yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 