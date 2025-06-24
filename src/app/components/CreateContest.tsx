'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useApproveToken } from '../hooks/useApproveToken';
import { CONTRACT_ADDRESSES } from '../constants';

export function CreateContest({ onContestCreated }: { onContestCreated: () => void }) {
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
    if (!address || !title || !details || !statement || !stakeAmount) {
      alert('Please fill in all fields');
      return;
    }

    const stakeInWei = parseUnits(stakeAmount, 6); // USDC has 6 decimals

    try {
      // First approve tokens
      await approve(stakeInWei);
      
      // Then create contest
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
              { name: 'stakeAmount', type: 'uint256' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'createContest',
        args: [title, details, statement, stakeInWei],
      });
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Error creating contest. Please try again.');
    }
  };

  if (isContestSuccess) {
    onContestCreated();
    return (
      <div className="text-center p-4">
        <div className="text-green-600 font-semibold mb-2">✅ Contest created successfully!</div>
        <button
          onClick={() => {
            setTitle('');
            setDetails('');
            setStatement('');
            setStakeAmount('');
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Create Another Contest
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleCreateContest(); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contest Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Bitcoin Price Prediction"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contest Details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the prediction contest..."
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prediction Statement
        </label>
        <input
          type="text"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., BTC > $100k by end of year?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stake Amount (USDC)
        </label>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1000"
          min="0"
          step="0.01"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isContestLoading || isApproving}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2 px-4 rounded-md transition-colors"
      >
        {isContestLoading ? 'Creating Contest...' : isApproving ? 'Approving Tokens...' : 'Create Contest'}
      </button>
    </form>
  );
} 