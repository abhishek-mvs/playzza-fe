import { ScorecardData } from '@/types/match'
import { useState, useEffect } from 'react'
import { Button } from './ui/Button'

interface ScorecardProps {
  matchId: string
}

export default function Scorecard({ matchId }: ScorecardProps) {
  const [scorecardData, setScorecardData] = useState<ScorecardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchScorecard = async () => {
    console.log('fetching scorecard')
    try {
      setLoading(true)
      setError(null) // Clear any previous errors
      const response = await fetch(`http://localhost:8080/v1/scorecard/${matchId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch scorecard')
      }
      const data = await response.json()
      setScorecardData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (matchId) {
      console.log('matchId', matchId)
      fetchScorecard() // Initial fetch
      
      // Set up interval for auto-refresh every 5 minutes (300000ms)
      const interval = setInterval(fetchScorecard, 300000)
      
      // Cleanup function to clear interval when component unmounts or matchId changes
      return () => clearInterval(interval)
    }
  }, [matchId])

  const getTeamsPlaying = (data: ScorecardData): string => {
    // Always use team details from matchInfo
    return `${data.matchInfo.team1.name} and ${data.matchInfo.team2.name}`
  }

  const getTeamInningsCount = (data: ScorecardData): { [key: string]: number } => {
    if (!data.scorecard) return {}
    const inningsCount: { [key: string]: number } = {}
    data.scorecard.forEach((innings) => {
      inningsCount[innings.batTeamName] = (inningsCount[innings.batTeamName] || 0) + 1
    })
    return inningsCount
  }

  const getBowlingTeam = (battingTeam: string, data: ScorecardData): string => {
    // Always use team details from matchInfo
    return battingTeam === data.matchInfo.team1.name 
      ? data.matchInfo.team2.name 
      : data.matchInfo.team1.name
  }

  if (loading) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-400">Loading scorecard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-red-400 text-center">Error: {error}</div>
      </div>
    )
  }

  if (!scorecardData) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-gray-400 text-center">No scorecard data available</div>
      </div>
    )
  }

  // Handle case where scorecard is null (match hasn't started)
  if (!scorecardData.scorecard) {
    const teams = getTeamsPlaying(scorecardData)
    return (
      <div className="p-4 h-full max-w-6xl mx-auto">
        {/* Match Header */}
        <div className="bg-gray-800/50 border border-gray-700/30 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-xl font-bold text-white">{scorecardData.appIndex.seoTitle}</h1>
            <Button 
              onClick={fetchScorecard}
              disabled={loading}
              variant="primary"
              size="sm"
              loading={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          <p className="text-gray-300 mb-1"><strong>Teams Playing:</strong> {teams}</p>
          <p className="text-gray-300 mb-1"><strong>Match Status:</strong> {scorecardData.status}</p>
          <p className="text-gray-300 mb-1"><strong>Match Complete:</strong> {scorecardData.isMatchComplete ? 'Yes' : 'No'}</p>
          {lastUpdated && (
            <p className="text-gray-400 text-sm mt-2">
              <strong>Last Updated:</strong> {lastUpdated.toLocaleTimeString()} (Auto-refreshes every 5 minutes)
            </p>
          )}
        </div>

        {/* Match Not Started Message */}
        <div className="bg-yellow-900/30 border border-yellow-700/30 rounded-lg p-6 text-center">
          <div className="text-yellow-300">
            <h2 className="text-lg font-semibold mb-2">Match Not Started Yet</h2>
            <p className="text-sm">
              The match between {teams} is yet to begin. 
              {scorecardData.status && ` ${scorecardData.status}`}
            </p>
            <p className="text-sm mt-2">
              Scorecard will be available once the match starts.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const teams = getTeamsPlaying(scorecardData)
  const teamInningsCount: { [key: string]: number } = getTeamInningsCount(scorecardData)


  return (
    <div className="p-4 h-full max-w-6xl mx-auto">
      {/* Match Header */}
      <div className="bg-gray-800/50 border border-gray-700/30 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl font-bold text-white">{scorecardData.appIndex.seoTitle}</h1>
          <Button 
            onClick={fetchScorecard}
            disabled={loading}
            variant="primary"
            size="sm"
            loading={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <p className="text-gray-300 mb-1"><strong>Teams Playing:</strong> {teams}</p>
        <p className="text-gray-300 mb-1"><strong>Match Status:</strong> {scorecardData.status}</p>
        <p className="text-gray-300 mb-1"><strong>Match Complete:</strong> {scorecardData.isMatchComplete ? 'Yes' : 'No'}</p>
        {lastUpdated && (
          <p className="text-gray-400 text-sm mt-2">
            <strong>Last Updated:</strong> {lastUpdated.toLocaleTimeString()} (Auto-refreshes every 5 minutes)
          </p>
        )}
      </div>

      {/* Innings */}
      {scorecardData.scorecard.slice().reverse().map((innings, index) => {
        const bowlingTeam = getBowlingTeam(innings.batTeamName, scorecardData)
        const inningsNumber = teamInningsCount[innings.batTeamName]
        teamInningsCount[innings.batTeamName] = inningsNumber - 1
        return (
          <div key={innings.inningsId} className="mb-8 bg-gray-800/50 border border-gray-700/30 rounded-lg shadow-sm">
            {/* Innings Header */}
            <div className="bg-blue-900/30 border-b border-blue-700/30 p-4">
              <h2 className="text-lg font-bold text-blue-300">
                {innings.batTeamName} INNINGS {inningsNumber}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-300">
                <div><strong>Batting:</strong> {innings.batTeamName}</div>
                <div><strong>Bowling:</strong> {bowlingTeam}</div>
                <div><strong>Score:</strong> {innings.score}/{innings.wickets} ({innings.overs} overs)</div>
                <div><strong>Run Rate:</strong> {innings.runRate.toFixed(2)}</div>
              </div>
            </div>

            {/* Batting Section */}
            {innings.batsman.length > 0 && (
              <div className="p-4">
                <h3 className="text-md font-semibold mb-3 text-blue-300">BATTING ({innings.batTeamName})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse text-gray-300">
                    <thead>
                      <tr className="bg-gray-700/50 text-gray-200">
                        <th className="border border-gray-600 px-2 py-1 text-left">Name</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">Runs</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">Balls</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">4s</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">6s</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">SR</th>
                        <th className="border border-gray-600 px-2 py-1 text-left">Out Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {innings.batsman.map((batsman, i) => (
                        <tr key={batsman.id} className={"hover:bg-gray-700/30 " + (i % 2 === 0 ? "bg-gray-800/30" : "bg-gray-700/20") + " text-gray-300"}>
                          <td className="border border-gray-600 px-2 py-1 font-medium">{batsman.name}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{batsman.runs}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{batsman.balls}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{batsman.fours}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{batsman.sixes}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{batsman.strkRate}</td>
                          <td className="border border-gray-600 px-2 py-1 text-sm">{batsman.outDec || 'not out'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bowling Section */}
            {innings.bowler.length > 0 && (
              <div className="p-4 border-t border-gray-700/30">
                <h3 className="text-md font-semibold mb-3 text-blue-300">BOWLING ({bowlingTeam})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse text-gray-300">
                    <thead>
                      <tr className="bg-gray-700/50 text-gray-200">
                        <th className="border border-gray-600 px-2 py-1 text-left">Name</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">Overs</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">Wickets</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">Runs</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">Maidens</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">Economy</th>
                        <th className="border border-gray-600 px-2 py-1 text-center">Balls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {innings.bowler.map((bowler, i) => (
                        <tr key={bowler.id} className={"hover:bg-gray-700/30 " + (i % 2 === 0 ? "bg-gray-800/30" : "bg-gray-700/20") + " text-gray-300"}>
                          <td className="border border-gray-600 px-2 py-1 font-medium">{bowler.name}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{bowler.overs}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{bowler.wickets}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{bowler.runs}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{bowler.maidens}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{bowler.economy}</td>
                          <td className="border border-gray-600 px-2 py-1 text-center">{bowler.balls}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Extras Section */}
            {innings.extra.total > 0 && (
              <div className="p-4 border-t border-gray-700/30 bg-gray-700/20">
                <h4 className="text-sm font-semibold mb-2 text-blue-300">EXTRAS</h4>
                <div className="text-sm text-gray-300">
                  Byes: {innings.extra.byes}, Leg Byes: {innings.extra.legByes}, 
                  Wides: {innings.extra.wides}, No Balls: {innings.extra.noBalls}, 
                  Penalty: {innings.extra.penalty}
                </div>
                <div className="text-sm font-medium mt-1 text-gray-300">
                  Total Extras: {innings.extra.total}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
} 