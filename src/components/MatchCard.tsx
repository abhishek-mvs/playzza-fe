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
        <div className="flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 truncate flex-1 mr-2">
              {match.matchDesc} <span className="text-gray-500">|</span> {match.seriesName}
            </h4>
            <Badge variant="secondary" size="sm" className="flex-shrink-0">
              {match.matchFormat}
            </Badge>
          </div>
            
          <p className="text-sm text-gray-300 font-medium truncate">
            {match.team1.teamName}
          </p>
          <div className="my-1">
            <div className="w-12 h-px bg-gray-500"></div>
          </div>
          <p className="text-sm text-gray-300 font-medium truncate">
           {match.team2.teamName}
          </p>
          <div className="mt-3">
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-600/20 text-blue-300 rounded-md border border-blue-500/30 min-w-0 max-w-full truncate">
              {match.status}
            </span>
          </div>
          {/* Contest stats at the bottom */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
            <span className="text-gray-300">Contests</span>
            <div className="flex items-center">
              <span className="text-green-400">Active: <span className="font-semibold">{stats?.active || 0}</span></span>
              <span className="ml-2 text-blue-400">Total: <span className="font-semibold">{totalContests}</span></span>
              {isLoading && (
                <div className="ml-2">
                  <Loading size="sm" text="" />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 