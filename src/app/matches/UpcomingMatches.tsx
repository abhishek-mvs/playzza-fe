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
    }
  }

  useEffect(() => {
    fetchMatches() // initial load
    const interval = setInterval(fetchMatches, 60000) // every 1m
    return () => clearInterval(interval) // cleanup on unmount
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Upcoming Matches</h1>
      {loading ? (
        <p>Loading...</p>
      ) : matches.length === 0 ? (
        <p>No upcoming matches available.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => (
            <li key={match.matchId} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold text-center">{match.matchDesc} ({match.matchFormat})</h2>
              <p className="text-gray-700 text-center">
                {match.team1.teamName} vs {match.team2.teamName}
              </p>
              <p className="text-sm text-blue-600 text-center">{match.status}</p>
              <p className="text-sm text-green-600 text-center">{match.state}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}