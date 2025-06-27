import { useState, useEffect } from 'react'

type Batsman = {
  id: number
  balls: number
  runs: number
  fours: number
  sixes: number
  strkRate: string
  name: string
  outDec: string
}

type Bowler = {
  id: number
  overs: string
  wickets: number
  maidens: number
  runs: number
  economy: string
  name: string
  balls: number
}

type Extra = {
  byes: number
  legByes: number
  wides: number
  noBalls: number
  penalty: number
  total: number
}

type Innings = {
  inningsId: number
  batsman: Batsman[]
  bowler: Bowler[]
  extra: Extra
  score: number
  wickets: number
  overs: number
  runRate: number
  batTeamName: string
  batTeamSName: string
  ballNbr: number
  rpb: number
}

type AppIndex = {
  seoTitle: string
  webURL: string
}

type ScorecardData = {
  appIndex: AppIndex
  scorecard: Innings[]
  isMatchComplete: boolean
  status: string
}

interface ScorecardProps {
  matchId: string
}

export default function Scorecard({ matchId }: ScorecardProps) {
  const [scorecardData, setScorecardData] = useState<ScorecardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8080/v1/scorecard/${matchId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch scorecard')
        }
        const data = await response.json()
        setScorecardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      fetchScorecard()
    }
  }, [matchId])

  const getTeamsPlaying = (data: ScorecardData): string => {
    const teams = new Set<string>()
    data.scorecard.forEach(innings => {
      teams.add(innings.batTeamName)
    })
    return Array.from(teams).join(' and ')
  }

  const getBowlingTeam = (battingTeam: string, data: ScorecardData): string => {
    const teams = new Set<string>()
    data.scorecard.forEach(innings => {
      teams.add(innings.batTeamName)
    })
    const allTeams = Array.from(teams)
    return allTeams.find(team => team !== battingTeam) || 'Unknown'
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">Loading scorecard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 text-center">Error: {error}</div>
      </div>
    )
  }

  if (!scorecardData) {
    return (
      <div className="p-4">
        <div className="text-center">No scorecard data available</div>
      </div>
    )
  }

  const teams = getTeamsPlaying(scorecardData)
  const teamInningsCount: { [key: string]: number } = {}

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Match Header */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h1 className="text-xl font-bold mb-2">{scorecardData.appIndex.seoTitle}</h1>
        <p className="text-gray-700 mb-1"><strong>Teams Playing:</strong> {teams}</p>
        <p className="text-gray-700 mb-1"><strong>Match Status:</strong> {scorecardData.status}</p>
        <p className="text-gray-700"><strong>Match Complete:</strong> {scorecardData.isMatchComplete ? 'Yes' : 'No'}</p>
      </div>

      {/* Innings */}
      {scorecardData.scorecard.map((innings, index) => {
        teamInningsCount[innings.batTeamName] = (teamInningsCount[innings.batTeamName] || 0) + 1
        const bowlingTeam = getBowlingTeam(innings.batTeamName, scorecardData)

        return (
          <div key={innings.inningsId} className="mb-8 bg-white border rounded-lg shadow-sm">
            {/* Innings Header */}
            <div className="bg-blue-50 p-4 border-b">
              <h2 className="text-lg font-bold text-blue-800">
                {innings.batTeamName} INNINGS {teamInningsCount[innings.batTeamName]}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                <div><strong>Batting:</strong> {innings.batTeamName}</div>
                <div><strong>Bowling:</strong> {bowlingTeam}</div>
                <div><strong>Score:</strong> {innings.score}/{innings.wickets} ({innings.overs} overs)</div>
                <div><strong>Run Rate:</strong> {innings.runRate.toFixed(2)}</div>
              </div>
            </div>

            {/* Batting Section */}
            {innings.batsman.length > 0 && (
              <div className="p-4">
                <h3 className="text-md font-semibold mb-3 text-gray-800">BATTING ({innings.batTeamName})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-2 py-1 text-left">Name</th>
                        <th className="border px-2 py-1 text-center">Runs</th>
                        <th className="border px-2 py-1 text-center">Balls</th>
                        <th className="border px-2 py-1 text-center">4s</th>
                        <th className="border px-2 py-1 text-center">6s</th>
                        <th className="border px-2 py-1 text-center">SR</th>
                        <th className="border px-2 py-1 text-left">Out Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {innings.batsman.map((batsman) => (
                        <tr key={batsman.id} className="hover:bg-gray-50">
                          <td className="border px-2 py-1 font-medium">{batsman.name}</td>
                          <td className="border px-2 py-1 text-center">{batsman.runs}</td>
                          <td className="border px-2 py-1 text-center">{batsman.balls}</td>
                          <td className="border px-2 py-1 text-center">{batsman.fours}</td>
                          <td className="border px-2 py-1 text-center">{batsman.sixes}</td>
                          <td className="border px-2 py-1 text-center">{batsman.strkRate}</td>
                          <td className="border px-2 py-1 text-sm">
                            {batsman.outDec || 'not out'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bowling Section */}
            {innings.bowler.length > 0 && (
              <div className="p-4 border-t">
                <h3 className="text-md font-semibold mb-3 text-gray-800">BOWLING ({bowlingTeam})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-2 py-1 text-left">Name</th>
                        <th className="border px-2 py-1 text-center">Overs</th>
                        <th className="border px-2 py-1 text-center">Wickets</th>
                        <th className="border px-2 py-1 text-center">Runs</th>
                        <th className="border px-2 py-1 text-center">Maidens</th>
                        <th className="border px-2 py-1 text-center">Economy</th>
                        <th className="border px-2 py-1 text-center">Balls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {innings.bowler.map((bowler) => (
                        <tr key={bowler.id} className="hover:bg-gray-50">
                          <td className="border px-2 py-1 font-medium">{bowler.name}</td>
                          <td className="border px-2 py-1 text-center">{bowler.overs}</td>
                          <td className="border px-2 py-1 text-center">{bowler.wickets}</td>
                          <td className="border px-2 py-1 text-center">{bowler.runs}</td>
                          <td className="border px-2 py-1 text-center">{bowler.maidens}</td>
                          <td className="border px-2 py-1 text-center">{bowler.economy}</td>
                          <td className="border px-2 py-1 text-center">{bowler.balls}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Extras Section */}
            {innings.extra.total > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <h4 className="text-sm font-semibold mb-2">EXTRAS</h4>
                <div className="text-sm">
                  Byes: {innings.extra.byes}, Leg Byes: {innings.extra.legByes}, 
                  Wides: {innings.extra.wides}, No Balls: {innings.extra.noBalls}, 
                  Penalty: {innings.extra.penalty}
                </div>
                <div className="text-sm font-medium mt-1">
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