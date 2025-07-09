'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../app/constants';
import posthog from '../../instrumentation-client';

export function useCancelContest() {
  const { address } = useAccount();
  const [cancellingContestId, setCancellingContestId] = useState<number | null>(null);
  const [cancellingContest, setCancellingContest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract: writeCancel, data: cancelHash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isCancelLoading, isSuccess: isCancelSuccess, isError: isCancelError, error: transactionError } = useWaitForTransactionReceipt({
    hash: cancelHash,
  });

  // Reset states when cancel transaction succeeds
  useEffect(() => {
    if (isCancelSuccess) {
      setCancellingContestId(null);
      setCancellingContest(false);
      setError(null);
      console.log("Cancel contest transaction confirmed");
      posthog.capture('contest_cancelled', {
        address,
        contestId: cancellingContestId,
      });
    }
  }, [isCancelSuccess]);

  // Handle transaction errors
  useEffect(() => {
    if (isCancelError && transactionError) {
      setCancellingContestId(null);
      setCancellingContest(false);
      setError(`Transaction failed`);
      console.error('Transaction error:', transactionError);
      posthog.capture('contest_cancel_failed', {
        address,
        contestId: cancellingContestId,
        error: transactionError?.message || 'unknown',
      });
    }
  }, [isCancelError, transactionError]);

  // Handle write contract errors (user rejection, etc.)
  useEffect(() => {
    if (writeError) {
      setCancellingContestId(null);
      setCancellingContest(false);
      setError(`Failed to submit transaction`);
      console.error('Write contract error:', writeError);
      posthog.capture('contest_cancel_failed', {
        address,
        contestId: cancellingContestId,
        error: writeError?.message || 'unknown',
      });
    }
  }, [writeError]);

  // Update cancelling state based on transaction status
  useEffect(() => {
    if (isWritePending || isCancelLoading) {
      setCancellingContest(true);
    } else if (isCancelSuccess || isCancelError || writeError) {
      setCancellingContest(false);
    }
  }, [isWritePending, isCancelLoading, isCancelSuccess, isCancelError, writeError]);

  const handleCancelContest = async (contestId: number | bigint) => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    // Clear any previous errors
    setError(null);
    
    try {
      console.log("Cancelling contest:", contestId);
      setCancellingContestId(Number(contestId));
      
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
      setError('Error cancelling contest. Please try again.');
      setCancellingContestId(null);
      setCancellingContest(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    handleCancelContest,
    cancellingContestId,
    cancellingContest,
    isCancelLoading,
    isCancelSuccess,
    error,
    clearError,
  };
} 