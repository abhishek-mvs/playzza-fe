'use client'

import { useEffect, useState } from 'react'
import MatchCard from '../../components/MatchCard'
import { MatchInfo } from '../../types/match'

export default function LiveMatches() {
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMatches = async () => {
    try {
      const res = await fetch('https://pm-backend-production.up.railway.app/v1/live-matches')
      const data = await res.json()
      const matchList: MatchInfo[] = []
      data.typeMatches?.forEach((typeMatch: any) => {
        typeMatch.seriesMatches?.forEach((seriesMatch: any) => {
          seriesMatch?.seriesAdWrapper?.matches?.forEach((match: any) => {
            if (match?.matchInfo) {
              matchList.push(match.matchInfo)
            }
          })
        })
      })

      setMatches(matchList)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch matches', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches() // initial load
    const interval = setInterval(fetchMatches, 60000) // every 1m
    return () => clearInterval(interval) // cleanup on unmount
  }, [])

  return (
    <div className="glass rounded-2xl p-2">
      <h2 className="text-lg font-bold text-white mb-1">
        <span className="mr-3">🔥</span>
        Live Matches
      </h2>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading live matches...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📺</span>
          </div>
          <p className="text-gray-400 text-lg">No live matches available at the moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide py-2">
          <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
            {matches.map((match) => (
              <div key={match.matchId} className="w-80 flex-shrink-0">
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}