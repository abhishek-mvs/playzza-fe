'use client'

import { useEffect, useState } from 'react'

type MatchInfo = {
  matchId: number
  matchDesc: string
  matchFormat: string
  state: string
  status: string
  team1: { teamName: string }
  team2: { teamName: string }
}

export default function UpcomingMatches() {
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMatches = async () => {
    try {
      const res = await fetch('http://localhost:8080/v1/upcoming-matches')
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
    <div className="glass rounded-2xl p-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <span className="mr-3">📅</span>
        Upcoming Matches
      </h2>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading upcoming matches...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-gray-400 text-lg">No upcoming matches available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.matchId} className="glass rounded-xl p-6 hover:bg-white hover:bg-opacity-10 transition-all duration-300 group">
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
          ))}
        </div>
      )}
    </div>
  )
}