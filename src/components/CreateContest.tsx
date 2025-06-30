'use client';

import { useState } from 'react';
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

    const stakeInWei = parseUSDC(stakeAmount);

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
        <Button
          onClick={() => {
            setTitle('');
            setDetails('');
            setStatement('');
            setStakeAmount('');
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
    <form onSubmit={(e) => { e.preventDefault(); handleCreateContest(); }} className="space-y-6">
      <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
        <p className="text-sm text-blue-200 font-medium">
          <span className="mr-2">🏏</span>
          <strong>Creating contest for Match ID:</strong> {matchId}
        </p>
      </div>
      
      <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
        <label className="block text-sm font-semibold text-gray-100 mb-2">
          Contest Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300"
          placeholder="e.g., Virat kohli will hit 100 runs in this match"
          required
        />
      </div>

      <div className="p-4 rounded-xl border border-gray-700/60 bg-gray-900/70 backdrop-blur">
        <label className="block text-sm font-semibold text-gray-100 mb-2">
          Contest Details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-300 transition-all duration-300 resize-none"
          placeholder="Describe the prediction contest..."
          rows={3}
          required
        />
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