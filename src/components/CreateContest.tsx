'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useCreateContest } from '../hooks/useCreateContest';
import { Button } from './ui/Button';
import { MatchInfoDetailed } from '@/types/match';
import { HeroConnectButton } from './ConnectButton';

export function CreateContest({ 
  onContestCreated, 
  matchId,
  matchDetails
}: { 
  onContestCreated: () => void;
  matchId: string;
  matchDetails: MatchInfoDetailed;
}) {
  const { isConnected } = useAccount();
  const [statement, setStatement] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [oddsNumerator, setOddsNumerator] = useState('1');
  const [oddsDenominator, setOddsDenominator] = useState('1');
  const [contestExpiryValue, setContestExpiryValue] = useState('4');
  const [contestExpiryUnit, setContestExpiryUnit] = useState('hours');
  const [settleOption, setSettleOption] = useState('endOfMatch');

  const { 
    handleCreateContest, 
    creatingContest, 
    isContestLoading, 
    isApproving, 
    isContestSuccess, 
    usdcBalance,
    error: createError,
    clearError: clearCreateError,
    currentStep
  } = useCreateContest();

  // Handle contest creation success
  useEffect(() => {
    if (isContestSuccess) {
      onContestCreated();
    }
  }, [isContestSuccess, onContestCreated]);

  // Calculate odds and potential profits
  const { odds, creatorProfit, contestantStake, totalPot } = useMemo(() => {
    const num = parseInt(oddsNumerator) || 1;
    const den = parseInt(oddsDenominator) || 1;
    const stake = parseFloat(stakeAmount) || 0;
    
    // Calculate odds as numerator/denominator (scaled by 1e6)
    const calculatedOdds = (num / den) * 1e6;
    
    // Creator's profit if they win
    const creatorProfitAmount = stake * (num / den);
    
    // Contestant's stake (what they need to put up)
    const contestantStakeAmount = stake * (num / den);
    
    // Total pot
    const totalPotAmount = stake + contestantStakeAmount;
    
    return {
      odds: calculatedOdds,
      creatorProfit: creatorProfitAmount,
      contestantStake: contestantStakeAmount,
      totalPot: totalPotAmount
    };
  }, [oddsNumerator, oddsDenominator, stakeAmount]);

  // Check if user has sufficient balance
  const hasInsufficientBalance = useMemo(() => {
    if (!usdcBalance || !stakeAmount) return false;
    const stakeInWei = parseFloat(stakeAmount) * 1e6; // Convert to USDC units (6 decimals)
    return stakeInWei > Number(usdcBalance.value);
  }, [usdcBalance, stakeAmount]);

  const handleSubmit = async () => {
    await handleCreateContest({
      statement,
      matchId,
      stakeAmount,
      oddsNumerator,
      oddsDenominator,
      contestExpiryValue,
      contestExpiryUnit,
      settleOption,
      matchDetails
    });
  };

  if (matchDetails.state === 'complete') {
    return (
      <div className="text-center p-8">
        <div className="text-red-400 font-bold text-xl mb-4">
          Contest creation is disabled as the match is complete.
        </div>
      </div>
    );
  }

  if (isContestSuccess) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✅</span>
        </div>
        <div className="text-green-400 font-bold text-xl mb-4">Contest created successfully!</div>
        <p className="text-gray-300 mb-6">Your contest is now live and ready for opponents to join.</p>
        <Button
          onClick={() => {
            setStatement('');
            setStakeAmount('');
            setOddsNumerator('1');
            setOddsDenominator('1');
            setContestExpiryValue('4');
            setContestExpiryUnit('hours');
            setSettleOption('endOfMatch');
          }}
          variant="primary"
          size="lg"
        >
          Create Another Contest
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      {/* Error Display */}
      {createError && (
        <div className="bg-red-900/30 border border-red-700/30 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-red-400 font-semibold mb-2">Error Creating Contest</h4>
              <p className="text-red-300 text-sm">{createError}</p>
            </div>
            <button
              onClick={clearCreateError}
              className="ml-4 text-red-400 hover:text-red-300 text-sm font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Prediction Statement */}
      <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
        <label className="block text-sm font-semibold text-gray-100 mb-2">
          Prediction Statement
        </label>
        <input
          type="text"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300"
          placeholder="e.g., Virat kohli will hit 100 runs in this match"
          required
        />
      </div>
      {/* Settle Result */}
      <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
        <label className="block text-sm font-semibold text-gray-100 mb-2">
          Result
        </label>
        {matchDetails.matchFormat === 'TEST' ? (
          <select
            value={settleOption}
            onChange={e => setSettleOption(e.target.value)}
            className="w-full px-3 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 transition-all duration-300"
          >
            <option value="endOfDay">End of Day {matchDetails.testDayNumber}</option>
            <option value="endOfMatch">End of Test Match</option>
          </select>
        ) : (
          <input
            type="text"
            value="End of Match"
            disabled
            className="w-full px-3 py-2 bg-transparent border border-gray-700 rounded-lg text-gray-100 placeholder-gray-300 transition-all duration-300 cursor-not-allowed"
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="p-2 sm:p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
          <label className="block text-xs sm:text-sm font-semibold text-gray-100 mb-1 sm:mb-2">
            Stake (USDC)
          </label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className={`w-full px-2 sm:px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300 text-sm ${
              hasInsufficientBalance 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-700 focus:ring-blue-500'
            }`}
            placeholder="10"
            min="0"
            step="0.01"
            required
          />
          {hasInsufficientBalance && (
            <p className="text-red-400 text-xs mt-1">
              Insufficient balance
            </p>
          )}
        </div>
        <div className="p-2 sm:p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
          <label className="block text-xs sm:text-sm font-semibold text-gray-100 mb-1 sm:mb-2">
            Odds Ratio
          </label>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <input
              type="number"
              value={oddsNumerator}
              onChange={(e) => setOddsNumerator(e.target.value)}
              className="flex-1 px-1 sm:px-2 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300 text-center text-sm"
              placeholder="1"
              min="1"
              max="100"
              required
            />
            <span className="text-gray-300 font-bold text-sm">:</span>
            <input
              type="number"
              value={oddsDenominator}
              onChange={(e) => setOddsDenominator(e.target.value)}
              className="flex-1 px-1 sm:px-2 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300 text-center text-sm"
              placeholder="1"
              min="1"
              max="100"
              required
            />
          </div>
        </div>
        <div className="p-2 sm:p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
          <label className="block text-xs sm:text-sm font-semibold text-gray-100 mb-1 sm:mb-2">
            Contest Expiry
          </label>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <input
              type="number"
              value={contestExpiryValue}
              onChange={(e) => setContestExpiryValue(e.target.value)}
              className="flex-1 px-2 sm:px-3 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300 text-sm"
              placeholder="4"
              min={contestExpiryUnit === 'hours' ? "0.5" : "1"}
              max={contestExpiryUnit === 'hours' ? "120" : "7200"}
              step={contestExpiryUnit === 'hours' ? "0.5" : "1"}
              required
            />
            <select
              value={contestExpiryUnit}
              onChange={(e) => {
                setContestExpiryUnit(e.target.value);
                // Reset value when switching units to prevent invalid values
                if (e.target.value === 'hours') {
                  setContestExpiryValue('4');
                } else {
                  setContestExpiryValue('120');
                }
              }}
              className="px-2 sm:px-3 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 transition-all duration-300 text-sm"
            >
              <option value="hours">hrs</option>
              <option value="minutes">min</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time profit calculation display */}
      {stakeAmount && oddsNumerator && oddsDenominator && (
        <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
        <div className="p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <div className="text-sm text-blue-200 font-medium mb-2">💰 Profit Calculation:</div>
          <div className="space-y-1 text-xs text-blue-100">
            <div>• Your stake: <span className="font-semibold">{stakeAmount} USDC</span></div>
            <div>• If you win, you get: <span className="font-semibold text-green-400">{creatorProfit.toFixed(2)} USDC</span></div>
            <div>• Contestant needs to stake: <span className="font-semibold text-yellow-400">{contestantStake.toFixed(2)} USDC</span></div>
            <div>• Total pot: <span className="font-semibold text-purple-400">{totalPot.toFixed(2)} USDC</span></div>
          </div>
        </div>
        </div>
      )}

      {isConnected ? (
        <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
          <Button
            type="submit"
            disabled={creatingContest || hasInsufficientBalance}
            variant="success"
            size="lg"
            loading={creatingContest}
            className="w-full"
          >
            {creatingContest ? (
              currentStep === 'approving' ? 'Approving Tokens...' : 'Creating Contest...'
            ) : hasInsufficientBalance ? (
              'Insufficient Balance'
            ) : (
              <>
                <span>Create Contest</span>
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex justify-center p-4">
          <HeroConnectButton />
        </div>
      )}
    </form>
  );
} 