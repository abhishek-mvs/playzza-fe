'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useApproveToken } from '../hooks/useApproveToken';
import { CONTRACT_ADDRESSES } from '../app/constants';

export function CreateContest({ 
  onContestCreated, 
  matchId 
}: { 
  onContestCreated: () => void;
  matchId: string;
}) {
  const { address } = useAccount();
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [statement, setStatement] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');

  const { writeContract: writeContest, data: contestHash } = useWriteContract();
  const { isLoading: isContestLoading, isSuccess: isContestSuccess } = useWaitForTransactionReceipt({
    hash: contestHash,
  });

  const { approve, isApproving, isApproved } = useApproveToken();

  const handleCreateContest = async () => {
    if (!address || !title || !details || !statement || !stakeAmount || !matchId) {
      alert('Please fill in all fields');
      return;
    }

    const stakeInWei = parseUnits(stakeAmount, 6); // USDC has 6 decimals

    try {
      // First approve tokens
      await approve(stakeInWei);
      
      // Then create contest with matchId
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
              { name: 'stakeAmount', type: 'uint256' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'createContest',
        args: [title, details, statement, matchId, stakeInWei],
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
        <button
          onClick={() => {
            setTitle('');
            setDetails('');
            setStatement('');
            setStakeAmount('');
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Create Another Contest
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleCreateContest(); }} className="space-y-6">
      <div className="glass p-4 rounded-xl border border-blue-500 border-opacity-30">
        <p className="text-sm text-blue-300 font-medium">
          <span className="mr-2">🏏</span>
          <strong>Creating contest for Match ID:</strong> {matchId}
        </p>
      </div>
      
      <div className="glass p-4 rounded-xl border border-gray-500 border-opacity-30">
        <label className="block text-sm font-semibold text-white mb-2">
          Contest Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
          placeholder="e.g., Bitcoin Price Prediction"
          required
        />
      </div>

      <div className="glass p-4 rounded-xl border border-gray-500 border-opacity-30">
        <label className="block text-sm font-semibold text-white mb-2">
          Contest Details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 resize-none"
          placeholder="Describe the prediction contest..."
          rows={3}
          required
        />
      </div>

      <div className="glass p-4 rounded-xl border border-gray-500 border-opacity-30">
        <label className="block text-sm font-semibold text-white mb-2">
          Prediction Statement
        </label>
        <input
          type="text"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
          placeholder="e.g., BTC > $100k by end of year?"
          required
        />
      </div>

      <div className="glass p-4 rounded-xl border border-gray-500 border-opacity-30">
        <label className="block text-sm font-semibold text-white mb-2">
          Stake Amount (USDC)
        </label>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
          placeholder="1000"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="glass p-4 rounded-xl border border-gray-500 border-opacity-30">
        <button
          type="submit"
          disabled={isContestLoading || isApproving}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-2"
        >
          {isContestLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating Contest...</span>
            </>
          ) : isApproving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Approving Tokens...</span>
            </>
          ) : (
            <>
              <span>🏆</span>
              <span>Create Contest</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
} 