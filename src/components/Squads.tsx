import React from 'react';
import { MatchInfoDetailed } from '@/types/match';

interface SquadsProps {
  matchInfo: MatchInfoDetailed;
  matchStarted: boolean;
}

const Squads: React.FC<SquadsProps> = ({ matchInfo, matchStarted }) => {
  const team1 = matchInfo.team1;
  const team2 = matchInfo.team2;
  const players1 = team1.playerDetails || [];
  const players2 = team2.playerDetails || [];

  // Group players: 0 = main, 1 = substitute, 2 = support staff
  function groupPlayers(players: typeof players1) {
    const groups = [[], [], []] as typeof players1[];
    players.forEach((p) => {
      if (p.isSupportStaff) groups[2].push(p);
      else if (p.substitute) groups[1].push(p);
      else groups[0].push(p);
    });
    return groups;
  }

  const groupedPlayers1 = groupPlayers(players1);
  const groupedPlayers2 = groupPlayers(players2);

  // For match not started: mix main + substitutes, then support staff
  const mixedPlayers1 = [...groupedPlayers1[0], ...groupedPlayers1[1]];
  const mixedPlayers2 = [...groupedPlayers2[0], ...groupedPlayers2[1]];
  const maxMixedLen = Math.max(mixedPlayers1.length, mixedPlayers2.length);
  const maxPlayingLen = Math.max(groupedPlayers1[0].length, groupedPlayers2[0].length);
  const maxSubsLen = Math.max(groupedPlayers1[1].length, groupedPlayers2[1].length);
  const maxSupportLen = Math.max(groupedPlayers1[2].length, groupedPlayers2[2].length);

  return (
    <div className="mb-8 bg-gray-800/50 border border-gray-700/30 rounded-lg shadow-sm">
      <div className="bg-green-900/30 border-b border-green-700/30 p-3">
        <h2 className="text-lg font-bold text-green-300 text-center tracking-wide">Squad</h2>
      </div>
      <div className="p-2 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <div className="text-center font-bold text-green-300 mb-1 text-base md:text-lg border-b-2 border-green-700/40 pb-1">
            {team1.name}
          </div>
          <div className="text-center font-bold text-green-300 mb-1 text-base md:text-lg border-b-2 border-green-700/40 pb-1">
            {team2.name}
          </div>

          {/* If match not started, show all players (main + subs) together, then support staff */}
          {!matchStarted ? (
            <>
              {Array.from({ length: maxMixedLen }).map((_, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={
                      `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                      (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                      ' hover:bg-gray-700/40 rounded'
                    }
                  >
                    {mixedPlayers1[idx] ? (
                      <>
                        <span className="font-medium text-white text-center text-sm md:text-base">
                          {mixedPlayers1[idx].fullName || mixedPlayers1[idx].name}
                          {mixedPlayers1[idx].keeper ? ' (WK)' : ''}
                          {mixedPlayers1[idx].captain ? ' (C)' : ''}
                        </span>
                        <span className="text-xs text-gray-400 text-center mt-0.5">
                          {mixedPlayers1[idx].role}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div
                    className={
                      `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                      (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                      ' hover:bg-gray-700/40 rounded'
                    }
                  >
                    {mixedPlayers2[idx] ? (
                      <>
                        <span className="font-medium text-white text-center text-sm md:text-base">
                          {mixedPlayers2[idx].fullName || mixedPlayers2[idx].name}
                          {mixedPlayers2[idx].keeper ? ' (WK)' : ''}
                          {mixedPlayers2[idx].captain ? ' (C)' : ''}
                        </span>
                        <span className="text-xs text-gray-400 text-center mt-0.5">
                          {mixedPlayers2[idx].role}
                        </span>
                      </>
                    ) : null}
                  </div>
                </React.Fragment>
              ))}
              {/* Support Staff label */}
              {maxSupportLen > 0 && (
                <div className="col-span-2 mt-3 mb-1 flex justify-center items-center">
                  <span className="px-3 py-1 rounded-full bg-gray-700/40 text-xs font-semibold text-green-200 tracking-wide">
                    Support Staff
                  </span>
                </div>
              )}
              {/* Support Staff rows */}
              {Array.from({ length: maxSupportLen }).map((_, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={
                      `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                      (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                      ' hover:bg-gray-700/40 rounded'
                    }
                  >
                    {groupedPlayers1[2][idx] ? (
                      <>
                        <span className="font-medium text-white text-center text-sm md:text-base">
                          {groupedPlayers1[2][idx].fullName || groupedPlayers1[2][idx].name}
                        </span>
                        <span className="text-xs text-gray-400 text-center mt-0.5">
                          {groupedPlayers1[2][idx].role}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div
                    className={
                      `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                      (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                      ' hover:bg-gray-700/40 rounded'
                    }
                  >
                    {groupedPlayers2[2][idx] ? (
                      <>
                        <span className="font-medium text-white text-center text-sm md:text-base">
                          {groupedPlayers2[2][idx].fullName || groupedPlayers2[2][idx].name}
                        </span>
                        <span className="text-xs text-gray-400 text-center mt-0.5">
                          {groupedPlayers2[2][idx].role}
                        </span>
                      </>
                    ) : null}
                  </div>
                </React.Fragment>
              ))}
            </>
          ) : (
            // If match started, show Playing XI, Substitutes, Support Staff as groups
            <>
              {/* Playing XI label */}
              {maxPlayingLen > 0 && (
                <div className="col-span-2 mt-3 mb-1 flex justify-center items-center">
                  <span className="px-3 py-1 rounded-full bg-gray-700/40 text-xs font-semibold text-green-200 tracking-wide">
                    Playing XI
                  </span>
                </div>
              )}
              {/* Playing XI rows */}
              {Array.from({ length: maxPlayingLen }).map((_, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={
                      `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                      (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                      ' hover:bg-gray-700/40 rounded'
                    }
                  >
                    {groupedPlayers1[0][idx] ? (
                      <>
                        <span className="font-medium text-white text-center text-sm md:text-base">
                          {groupedPlayers1[0][idx].fullName || groupedPlayers1[0][idx].name}
                          {groupedPlayers1[0][idx].keeper ? ' (WK)' : ''}
                          {groupedPlayers1[0][idx].captain ? ' (C)' : ''}
                        </span>
                        <span className="text-xs text-gray-400 text-center mt-0.5">
                          {groupedPlayers1[0][idx].role}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div
                    className={
                      `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                      (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                      ' hover:bg-gray-700/40 rounded'
                    }
                  >
                    {groupedPlayers2[0][idx] ? (
                      <>
                        <span className="font-medium text-white text-center text-sm md:text-base">
                          {groupedPlayers2[0][idx].fullName || groupedPlayers2[0][idx].name}
                          {groupedPlayers2[0][idx].keeper ? ' (WK)' : ''}
                          {groupedPlayers2[0][idx].captain ? ' (C)' : ''}
                        </span>
                        <span className="text-xs text-gray-400 text-center mt-0.5">
                          {groupedPlayers2[0][idx].role}
                        </span>
                      </>
                    ) : null}
                  </div>
                </React.Fragment>
              ))}
              {/* Substitutes label and rows only if there are any */}
              {maxSubsLen > 0 && (
                <>
                  {/* Divider */}
                  <div className="col-span-2 my-2 border-t border-gray-700/40" />
                  {/* Substitutes label */}
                  <div className="col-span-2 mt-3 mb-1 flex justify-center items-center">
                    <span className="px-3 py-1 rounded-full bg-gray-700/40 text-xs font-semibold text-green-200 tracking-wide">
                      Substitutes
                    </span>
                  </div>
                  {/* Substitutes rows */}
                  {Array.from({ length: maxSubsLen }).map((_, idx) => (
                    <React.Fragment key={idx}>
                      <div
                        className={
                          `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                          (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                          ' hover:bg-gray-700/40 rounded'
                        }
                      >
                        {groupedPlayers1[1][idx] ? (
                          <>
                            <span className="font-medium text-white text-center text-sm md:text-base">
                              {groupedPlayers1[1][idx].fullName || groupedPlayers1[1][idx].name}
                            </span>
                            <span className="text-xs text-gray-400 text-center mt-0.5">
                              {groupedPlayers1[1][idx].role}
                            </span>
                          </>
                        ) : null}
                      </div>
                      <div
                        className={
                          `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                          (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                          ' hover:bg-gray-700/40 rounded'
                        }
                      >
                        {groupedPlayers2[1][idx] ? (
                          <>
                            <span className="font-medium text-white text-center text-sm md:text-base">
                              {groupedPlayers2[1][idx].fullName || groupedPlayers2[1][idx].name}
                            </span>
                            <span className="text-xs text-gray-400 text-center mt-0.5">
                              {groupedPlayers2[1][idx].role}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </React.Fragment>
                  ))}
                </>
              )}
              {/* Support Staff label */}
              {maxSupportLen > 0 && (
                <>
                  <div className="col-span-2 my-2 border-t border-gray-700/40" />
                  <div className="col-span-2 mt-3 mb-1 flex justify-center items-center">
                    <span className="px-3 py-1 rounded-full bg-gray-700/40 text-xs font-semibold text-green-200 tracking-wide">
                      Support Staff
                    </span>
                  </div>
                </>
              )}
              {/* Support Staff rows */}
              {Array.from({ length: maxSupportLen }).map((_, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={
                      `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                      (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                      ' hover:bg-gray-700/40 rounded'
                    }
                  >
                    {groupedPlayers1[2][idx] ? (
                      <>
                        <span className="font-medium text-white text-center text-sm md:text-base">
                          {groupedPlayers1[2][idx].fullName || groupedPlayers1[2][idx].name}
                        </span>
                        <span className="text-xs text-gray-400 text-center mt-0.5">
                          {groupedPlayers1[2][idx].role}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div
                    className={
                      `flex flex-col items-center min-h-[36px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-2 text-center transition-colors duration-150 ` +
                      (idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20') +
                      ' hover:bg-gray-700/40 rounded'
                    }
                  >
                    {groupedPlayers2[2][idx] ? (
                      <>
                        <span className="font-medium text-white text-center text-sm md:text-base">
                          {groupedPlayers2[2][idx].fullName || groupedPlayers2[2][idx].name}
                        </span>
                        <span className="text-xs text-gray-400 text-center mt-0.5">
                          {groupedPlayers2[2][idx].role}
                        </span>
                      </>
                    ) : null}
                  </div>
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Squads; 