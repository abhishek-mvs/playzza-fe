'use client'

import { useEffect, useState } from 'react'
import MatchCard from '../../components/MatchCard'
import Scorecard from '../../components/Scorecard'

type MatchInfo = {
  matchId: number
  matchDesc: string
  matchFormat: string
  state: string
  status: string
  team1: { teamName: string }
  team2: { teamName: string }
}

export default function LiveMatches() {
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const fetchMatches = async () => {
    try {
      const res = await fetch('http://localhost:8080/v1/live-matches')
      const data = await res.json()
      const matchList: MatchInfo[] = []

      data.typeMatches?.forEach((typeMatch: any) => {
        typeMatch.seriesMatches?.forEach((seriesMatch: any) => {
          const match = seriesMatch?.seriesAdWrapper?.matches?.[0]?.matchInfo
          if (match) matchList.push(match)
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

  const handleMatchClick = (matchId: number) => {
    setSelectedMatchId(matchId)
  }

  const handleBackToMatches = () => {
    setSelectedMatchId(null)
  }

  // Show scorecard if a match is selected
  if (selectedMatchId) {
    return (
      <div className="p-4">
        <button 
          onClick={handleBackToMatches}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          ← Back to Live Matches
        </button>
        <Scorecard matchId={selectedMatchId.toString()} />
      </div>
    )
  }

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
            <MatchCard key={match.matchId} match={match} onClick={handleMatchClick} />
          ))}
        </ul>
      )}
    </div>
  )
}