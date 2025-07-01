'use client';

import { useState, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useApproveToken } from '../hooks/useApproveToken';
import { CONTRACT_ADDRESSES } from '../app/constants';
import { Button } from './ui/Button';
import { parseUSDC } from '@/utils/formatters';

export function CreateContest({ 
  onContestCreated, 
  matchId 
}: { 
  onContestCreated: () => void;
  matchId: string;
}) {
  const { address } = useAccount();
  const [statement, setStatement] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [oddsNumerator, setOddsNumerator] = useState('1');
  const [oddsDenominator, setOddsDenominator] = useState('1');
  const [contestExpiryValue, setContestExpiryValue] = useState('2');
  const [contestExpiryUnit, setContestExpiryUnit] = useState('hours');

  const { writeContract: writeContest, data: contestHash } = useWriteContract();
  const { isLoading: isContestLoading, isSuccess: isContestSuccess } = useWaitForTransactionReceipt({
    hash: contestHash,
  });

  const { approve, isApproving, isApproved } = useApproveToken();

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

  const handleCreateContest = async () => {
    if (!address || !statement || !stakeAmount || !matchId) {
      alert('Please fill in all fields');
      return;
    }

    const stakeInWei = parseUSDC(stakeAmount);
    console.log("Odds:", odds.toString())
    const oddsInWei = parseUnits(odds.toString(), 0);
    

    try {
      console.log('Creating contest with stake:', stakeInWei, 'and odds:', oddsInWei);
      const now = BigInt(Math.floor(Date.now() / 1000));
      const expiryValue = parseInt(contestExpiryValue) || 2;
      const expiryInMinutes = contestExpiryUnit === 'hours' ? expiryValue * 60 : expiryValue;
      const contestExpiry = now + BigInt(expiryInMinutes * 60); // Convert minutes to seconds
      const settleTime = contestExpiry + BigInt(30 * 60); // 30 minutes from now
      // First approve tokens
      await approve(stakeInWei);
      // Then create contest with matchId and odds
      writeContest({
        address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
        abi: [
          {
            name: 'createContest',
            type: 'function',
            inputs: [
              { name: 'title', type: 'string' },
              { name: 'details', type: 'string' },
              { name: 'stmt', type: 'string' },
              { name: 'matchId', type: 'string' },
              { name: 'stakeAmount', type: 'uint256' },
              { name: 'odds', type: 'uint256' },
              { name: 'contestExpiry', type: 'uint256' },
              { name: 'settleTime', type: 'uint256' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'createContest',
        args: [statement, "", statement, matchId, stakeInWei, oddsInWei, contestExpiry, settleTime],
      });
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Error creating contest. Please try again.');
    }
  };

  if (isContestSuccess) {
    onContestCreated();
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✅</span>
        </div>
        <div className="text-green-400 font-bold text-xl mb-4">Contest created successfully!</div>
        <Button
          onClick={() => {
            setStatement('');
            setStakeAmount('');
            setOddsNumerator('1');
            setOddsDenominator('1');
            setContestExpiryValue('2');
            setContestExpiryUnit('hours');
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
    <form onSubmit={(e) => { e.preventDefault(); handleCreateContest(); }} className="space-y-4">
      <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
        <p className="text-sm text-blue-200 font-medium">
          <span className="mr-2">🏏</span>
          <strong>Creating contest for Match ID:</strong> {matchId}
        </p>
      </div>


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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
          <label className="block text-sm font-semibold text-gray-100 mb-2">
            Stake Amount (USDC)
          </label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="w-full px-3 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300"
            placeholder="10"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
          <label className="block text-sm font-semibold text-gray-100 mb-2">
            Odds Ratio
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={oddsNumerator}
              onChange={(e) => setOddsNumerator(e.target.value)}
              className="flex-1 px-2 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300 text-center"
              placeholder="1"
              min="1"
              max="100"
              required
            />
            <span className="text-gray-300 font-bold">:</span>
            <input
              type="number"
              value={oddsDenominator}
              onChange={(e) => setOddsDenominator(e.target.value)}
              className="flex-1 px-2 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300 text-center"
              placeholder="1"
              min="1"
              max="100"
              required
            />
          </div>
        </div>
        <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
          <label className="block text-sm font-semibold text-gray-100 mb-2">
            Contest Expiry Time
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={contestExpiryValue}
              onChange={(e) => setContestExpiryValue(e.target.value)}
              className="flex-1 px-3 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300"
              placeholder="2"
              min={contestExpiryUnit === 'hours' ? "0.5" : "5"}
              max={contestExpiryUnit === 'hours' ? "24" : "1440"}
              step={contestExpiryUnit === 'hours' ? "0.5" : "5"}
              required
            />
            <select
              value={contestExpiryUnit}
              onChange={(e) => {
                setContestExpiryUnit(e.target.value);
                // Reset value when switching units to prevent invalid values
                if (e.target.value === 'hours') {
                  setContestExpiryValue('2');
                } else {
                  setContestExpiryValue('120');
                }
              }}
              className="px-3 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 transition-all duration-300"
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
      

      <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
        <Button
          type="submit"
          disabled={isContestLoading || isApproving}
          variant="success"
          size="lg"
          loading={isContestLoading || isApproving}
          className="w-full"
        >
          {isContestLoading ? (
            'Creating Contest...'
          ) : isApproving ? (
            'Approving Tokens...'
          ) : (
            <>
              <span>🏆</span>
              <span>Create Contest</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 