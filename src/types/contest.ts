interface Contest {
    creator: string;
    title: string;
    details: string;
    statement: string;
    matchId: string;
    stake: bigint;
    odds: bigint;
    opponent: string;
    settled: boolean;
    verdict: boolean;
    active: boolean;
  }

interface ContestStats {
    active: number;
    decisionPending: number;
    completed: number;
}

export type { Contest, ContestStats };