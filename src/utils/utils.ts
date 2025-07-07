import { MatchInfoDetailed } from "@/types/match";

export function getDayNumber(matchDetails: MatchInfoDetailed, endOfDay: boolean) {
    if (matchDetails.matchFormat === 'TEST' && endOfDay) {
        return matchDetails.testDayNumber;
    }
    return 0n;
}

export function getSettleTimeMsg(dayNumber: bigint) {
    if (dayNumber === 0n) {
        return 'Result: End of Match';
    }
    return `Result: End of Day ${dayNumber}`;
}