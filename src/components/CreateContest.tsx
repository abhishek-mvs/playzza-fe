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
    const oddsInWei = parseUnits(odds.toString(), 6);

    try {
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
              { name: 'odds', type: 'uint256' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'createContest',
        args: [statement, "", statement, matchId, stakeInWei, oddsInWei],
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
          <label className="block text-sm font-semibold text-gray-100 mb-2">
            Stake Amount (USDC)
          </label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300"
            placeholder="1000"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
          <label className="block text-sm font-semibold text-gray-100 mb-2">
            Odds Ratio (Creator:Contestant)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={oddsNumerator}
              onChange={(e) => setOddsNumerator(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300 text-center"
              placeholder="1"
              min="1"
              max="100"
              required
            />
            <span className="text-gray-300 font-bold text-lg">:</span>
            <input
              type="number"
              value={oddsDenominator}
              onChange={(e) => setOddsDenominator(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300 text-center"
              placeholder="1"
              min="1"
              max="100"
              required
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
        {/* Real-time profit calculation display */}
        {stakeAmount && oddsNumerator && oddsDenominator && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <div className="text-sm text-blue-200 font-medium mb-2">💰 Profit Calculation:</div>
            <div className="space-y-1 text-xs text-blue-100">
              <div>• Your stake: <span className="font-semibold">{stakeAmount} USDC</span></div>
              <div>• If you win, you get: <span className="font-semibold text-green-400">{creatorProfit.toFixed(2)} USDC</span></div>
              <div>• Contestant needs to stake: <span className="font-semibold text-yellow-400">{contestantStake.toFixed(2)} USDC</span></div>
              <div>• Total pot: <span className="font-semibold text-purple-400">{totalPot.toFixed(2)} USDC</span></div>
            </div>
          </div>
        )}
      </div>

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