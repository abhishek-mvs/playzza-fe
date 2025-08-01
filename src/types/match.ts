export type Match = {
  matchInfo: MatchInfo
  matchScore: MatchScore
}


export type MatchInfo = {
  matchId: number
  matchDesc: string
  seriesName: string
  matchFormat: string
  state: string
  status: string
  team1: { teamName: string, teamSName: string }
  team2: { teamName: string, teamSName: string }
} 

export type InningsScore = {
  inningsId: number
  runs: number
  wickets: number
  overs: number
}

export type TeamScore = {
  inngs1?: InningsScore
  inngs2?: InningsScore
}

export type MatchScore = {
  team1Score: TeamScore
  team2Score: TeamScore
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
  testDayNumber: number
  testDayStartTimestamp: number
  testDayEndTimestamp: number
  team1: {
    id: number
    name: string
    shortName: string,
    playerDetails: Players[]
  }
  team2: {
    id: number
    name: string
    shortName: string
    playerDetails: Players[]
  }
}

type Players = {
  id: number
  name: string
  fullName: string
  captain: boolean
  role: string
  keeper: boolean
  substitute: boolean
  isSupportStaff: boolean
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
  no_balls: number
  wides: number
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
  bowlTeamName: string
  bowlTeamSName: string
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
