'use client'

import { useEffect, useState } from 'react'
import MatchCard from '../../components/MatchCard'
import { MatchInfo } from '../../types/match'

export default function LiveMatches() {
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMatches = async () => {
    try {
      const res = await fetch('http://localhost:8080/v1/live-matches')
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
      <h1 className="text-2xl font-bold mb-4 text-center">Live Matches</h1>
      {loading ? (
        <p>Loading...</p>
      ) : matches.length === 0 ? (
        <p>No live matches available.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => (
            <MatchCard key={match.matchId} match={match} />
          ))}
        </ul>
      )}
    </div>
  )
}