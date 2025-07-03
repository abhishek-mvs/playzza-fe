'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveContests } from '../../hooks/useContests';
import { filterLiveContests } from '@/utils/filters';
import { ContestCard2 } from '../../components/ContestCard2';
import { Contest } from '../../types/contest';

export default function LiveContests() {
  const router = useRouter();
  const { contests, isLoading, refetch } = useActiveContests();
  const [liveContests, setLiveContests] = useState<Contest[]>([]);
  
  useEffect(() => {
    setLiveContests(filterLiveContests(contests || []));
  }, [contests]);

  const handleContestClick = (contest: Contest) => {
    console.log("contest", contest);
    // Create the same key used in the mapping
    const contestId = contest.id;
    console.log("contestId", contestId);
    if (contestId !== undefined) {
      router.push(`/contests/${contestId}`);
    }
  };

  return (
    <div className="glass rounded-2xl p-2">
      <h2 className="text-lg font-bold text-white mb-1">
        <span className="mr-3">⚡️</span>
        Live Contests
      </h2>
      {isLoading ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading live contests...</p>
        </div>
      ) : liveContests.length === 0 ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎲</span>
          </div>
          <p className="text-gray-400 text-lg">No live contests available at the moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide py-2">
          <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
            {liveContests.map((contest, idx) => (
              <div key={idx} className="w-80 flex-shrink-0">
                <div 
                  onClick={() => handleContestClick(contest)}
                  className="cursor-pointer"
                >
                  <ContestCard2 contest={contest} contestIndex={idx} onContestJoined={refetch} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 