'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../app/constants';

export function useCancelContest() {
  const { address } = useAccount();
  const [cancellingContestId, setCancellingContestId] = useState<number | null>(null);
  const [cancellingContest, setCancellingContest] = useState(false);

  const { writeContract: writeCancel, data: cancelHash } = useWriteContract();
  const { isLoading: isCancelLoading, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({
    hash: cancelHash,
  });

  // Reset states when cancel transaction succeeds
  useEffect(() => {
    if (isCancelSuccess) {
      setCancellingContestId(null);
      setCancellingContest(false);
      console.log("Cancel contest transaction confirmed");
    }
  }, [isCancelSuccess]);

  const handleCancelContest = async (contestId: number | bigint) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      console.log("Cancelling contest:", contestId);
      setCancellingContestId(Number(contestId));
      setCancellingContest(true);
      
      writeCancel({
        address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
        abi: [
          {
            name: 'cancelContest',
            type: 'function',
            inputs: [
              { name: 'contestId', type: 'uint256' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'cancelContest',
        args: [BigInt(contestId)],
      });
    } catch (error) {
      console.error('Error cancelling contest:', error);
      alert('Error cancelling contest. Please try again.');
      setCancellingContestId(null);
      setCancellingContest(false);
    }
  };

  return {
    handleCancelContest,
    cancellingContestId,
    cancellingContest,
    isCancelLoading,
    isCancelSuccess,
  };
} 