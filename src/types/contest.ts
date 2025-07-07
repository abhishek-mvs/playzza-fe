interface Contest {
    id: bigint;
    creator: string;
    statement: string;
    matchId: string;
    stake: bigint;
    odds: bigint;
    contestExpiry: bigint;
    settleTime: bigint;
    contestEndMetaData: bigint;
    opponent: string;
    opponentStake: bigint;
    createdAt: bigint;
    updatedAt: bigint;
    settled: boolean;
    verdict: boolean;
    active: boolean;
    cancelled: boolean;
    verdictReason: string;
  }

interface ContestStats {
    active: number;
    decisionPending: number;
    completed: number;
}

export type { Contest, ContestStats };