'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseUnits } from 'viem';
import { useApproveToken } from './useApproveToken';
import { CONTRACT_ADDRESSES } from '../app/constants';
import { parseUSDC } from '@/utils/formatters';
import { MatchInfoDetailed } from '@/types/match';
import { getDayNumber } from '@/utils/utils';

interface CreateContestParams {
  statement: string;
  matchId: string;
  stakeAmount: string;
  oddsNumerator: string;
  oddsDenominator: string;
  contestExpiryValue: string;
  contestExpiryUnit: string;
  settleOption: string;
  matchDetails: MatchInfoDetailed;
}

export function useCreateContest() {
  const { address } = useAccount();
  const [creatingContest, setCreatingContest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'idle' | 'approving' | 'creating'>('idle');
  const [pendingContestParams, setPendingContestParams] = useState<any>(null);

  const { writeContract: writeContest, data: contestHash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isContestLoading, isSuccess: isContestSuccess, isError: isContestError, error: transactionError } = useWaitForTransactionReceipt({
    hash: contestHash,
  });

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: CONTRACT_ADDRESSES.USDC as `0x${string}`,
  });

  const { approve, isApproving, isApproved, isApproveSuccess, approvalAmount, permitReady } = useApproveToken();

  // Reset states when contest creation succeeds
  useEffect(() => {
    if (isContestSuccess) {
      setCreatingContest(false);
      setCurrentStep('idle');
      setError(null);
      setPendingContestParams(null);
      console.log("Contest creation transaction confirmed");
    }
  }, [isContestSuccess]);

  // Handle contest creation errors
  useEffect(() => {
    if (isContestError && transactionError) {
      setCreatingContest(false);
      setCurrentStep('idle');
      setError(`Contest creation failed: ${transactionError.message}`);
      setPendingContestParams(null);
      console.error('Contest creation error:', transactionError);
    }
  }, [isContestError, transactionError]);

  // Handle write contract errors (user rejection, etc.)
  useEffect(() => {
    if (writeError) {
      setCreatingContest(false);
      setCurrentStep('idle');
      setError(`Failed to submit contest creation: ${writeError.message}`);
      setPendingContestParams(null);
      console.error('Write contract error:', writeError);
    }
  }, [writeError]);

  // Handle approval success and proceed to create contest
  useEffect(() => {
    if (isApproveSuccess && creatingContest && currentStep === 'approving' && pendingContestParams) {
      console.log("Approval successful, proceeding to create contest");
      setCurrentStep('creating');
      
      // Create contest with stored parameters
      writeContest({
        address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
        abi: [
          {
            name: 'createContest',
            type: 'function',
            inputs: [
              { name: 'stmt', type: 'string' },
              { name: 'matchId', type: 'string' },
              { name: 'stakeAmount', type: 'uint256' },
              { name: 'odds', type: 'uint256' },
              { name: 'contestExpiry', type: 'uint256' },
              { name: 'settleTime', type: 'uint256' },
              { name: 'dayNumber', type: 'uint64' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'createContest',
        args: [pendingContestParams.statement, pendingContestParams.matchId, pendingContestParams.stakeInWei, pendingContestParams.oddsInWei, pendingContestParams.contestExpiry, pendingContestParams.settleTime, BigInt(pendingContestParams.dayNumber)],
      });
    }
  }, [isApproveSuccess, creatingContest, currentStep, pendingContestParams, writeContest]);

  // Handle approval errors
  useEffect(() => {
    // Only check for approval errors if we have an approval amount and we're in the approving step
    if (approvalAmount > 0n && creatingContest && currentStep === 'approving') {
      // Wait longer before considering it a failure to give user time to approve in MetaMask
      const timeoutId = setTimeout(() => {
        // Check if we're still in approving state but not loading and not successful
        // Also check that the permit is ready (transaction has been submitted)
        if (!isApproving && !isApproveSuccess && creatingContest && currentStep === 'approving' && permitReady) {
          setCreatingContest(false);
          setCurrentStep('idle');
          setError('Token approval failed. Please try again.');
          setPendingContestParams(null);
          console.error('Approval failed or was rejected');
        }
      }, 5000); // Wait 5 seconds before considering it a failure

      return () => clearTimeout(timeoutId);
    }
  }, [isApproving, isApproveSuccess, approvalAmount, creatingContest, currentStep, permitReady]);

  // Update creating state based on transaction status
  useEffect(() => {
    if (isWritePending || isContestLoading) {
      setCreatingContest(true);
      setCurrentStep('creating');
    } else if (isContestSuccess || isContestError || writeError) {
      setCreatingContest(false);
      if (isContestSuccess) {
        setCurrentStep('idle');
      }
    }
  }, [isWritePending, isContestLoading, isContestSuccess, isContestError, writeError]);

  const handleCreateContest = async (params: CreateContestParams) => {
    const {
      statement,
      matchId,
      stakeAmount,
      oddsNumerator,
      oddsDenominator,
      contestExpiryValue,
      contestExpiryUnit,
      settleOption,
      matchDetails
    } = params;

    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (!statement || !stakeAmount || !matchId) {
      setError('Please fill in all required fields');
      return;
    }

    // Clear any previous errors
    setError(null);

    // Calculate odds
    const num = parseInt(oddsNumerator) || 1;
    const den = parseInt(oddsDenominator) || 1;
    const calculatedOdds = (num / den) * 1e6;

    const stakeInWei = parseUSDC(stakeAmount);
    const oddsInWei = parseUnits(calculatedOdds.toString(), 0);

    // Check balance before proceeding
    if (stakeInWei > (usdcBalance?.value || 0n)) {
      setError(`Insufficient USDC balance. You need ${stakeAmount} USDC but only have ${usdcBalance ? (Number(usdcBalance.formatted)).toFixed(2) : '0'} USDC.`);
      return;
    }

    try {
      console.log('Starting contest creation process with stake:', stakeInWei, 'and odds:', oddsInWei);
      setCreatingContest(true);
      setCurrentStep('approving');

      const now = BigInt(Math.floor(Date.now() / 1000));
      const expiryValue = parseInt(contestExpiryValue) || 2;
      const expiryInMinutes = contestExpiryUnit === 'hours' ? expiryValue * 60 : expiryValue;
      const contestExpiry = now + BigInt(expiryInMinutes * 60); // Convert minutes to seconds

      // Settle time logic
      let settleTime: bigint;
      if (matchDetails.matchFormat === 'TEST') {
        if (settleOption === 'endOfDay') {
          settleTime = BigInt(Math.floor(matchDetails.testDayEndTimestamp / 1000));
        } else {
          settleTime = BigInt(Math.floor(matchDetails.matchCompleteTimestamp / 1000));
        }
      } else {
        settleTime = BigInt(Math.floor(matchDetails.matchCompleteTimestamp / 1000));
      }

      const dayNumber = getDayNumber(matchDetails, settleOption === 'endOfDay');
      
      settleTime = settleTime + BigInt(60 * 60);
      console.log('Contest expiry:', contestExpiry, 'Settle time:', settleTime, 'Day number:', dayNumber);

      // Store contest parameters for when approval succeeds
      const contestParams = {
        statement,
        matchId,
        stakeInWei,
        oddsInWei,
        contestExpiry,
        settleTime,
        dayNumber
      };
      setPendingContestParams(contestParams);

      // First approve tokens
      await approve(stakeInWei);

      // The contest creation will be triggered automatically when approval succeeds
      // via the useEffect that watches isApproveSuccess

    } catch (error) {
      console.error('Error in contest creation process:', error);
      setError('Error creating contest. Please try again.');
      setCreatingContest(false);
      setCurrentStep('idle');
      setPendingContestParams(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    handleCreateContest,
    creatingContest,
    isContestLoading,
    isApproving,
    isContestSuccess,
    usdcBalance,
    error,
    clearError,
    currentStep,
  };
} 