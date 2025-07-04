export type MatchInfo = {
  matchId: number
  matchDesc: string
  seriesName: string
  matchFormat: string
  state: string
  status: string
  team1: { teamName: string }
  team2: { teamName: string }
} 

export type MatchInfoDetailed = {
  matchId: number
  matchDescription: string
  matchFormat: string
  matchType: string
  complete: boolean
  domestic: boolean
  matchStartTimestamp: number
  matchCompleteTimestamp: number
  dayNight: boolean
  year: number
  dayNumber: number
  state: string
  team1: {
    id: number
    name: string
    shortName: string
  }
  team2: {
    id: number
    name: string
    shortName: string
  }
}

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

export type ScorecardData = {
  appIndex: AppIndex
  scorecard: Innings[]
  isMatchComplete: boolean
  status: string
  matchInfo: MatchInfoDetailed
}
