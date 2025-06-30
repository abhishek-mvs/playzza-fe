import { Contest } from "@/types/contest";

export function filterLiveContests(contests: Contest[]) {
  const now = BigInt(Math.floor(Date.now() / 1000));
  
  return contests
    .filter(contest => now < contest.contestExpiry)
    .sort((a, b) => {
      // Sort in decreasing order of createdAt (newest first)
      if (a.createdAt > b.createdAt) return -1;
      if (a.createdAt < b.createdAt) return 1;
      return 0;
    });
}