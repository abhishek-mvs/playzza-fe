type MatchInfo = {
  matchId: number
  matchDesc: string
  matchFormat: string
  state: string
  status: string
  team1: { teamName: string }
  team2: { teamName: string }
}

interface MatchCardProps {
  match: MatchInfo
  onClick: (matchId: number) => void
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  return (
    <li 
      className="border p-4 rounded shadow hover:shadow-md transition-shadow cursor-pointer bg-white hover:bg-gray-50"
      onClick={() => onClick(match.matchId)}
    >
      <h2 className="text-xl font-semibold text-center">{match.matchDesc} ({match.matchFormat})</h2>
      <p className="text-gray-700 text-center">
        {match.team1.teamName} vs {match.team2.teamName}
      </p>
      <p className="text-sm text-blue-600 text-center">{match.status}</p>
      <p className="text-sm text-green-600 text-center">{match.state}</p>
    </li>
  )
} 