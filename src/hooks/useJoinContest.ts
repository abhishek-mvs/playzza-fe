'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../app/constants';
import { useApproveToken } from './useApproveToken';
import { useUSDCBalance } from './useUSDCBalance';
import { formatUSDC, calculateJoinAmount } from '@/utils/formatters';

export function useJoinContest() {
  const { address } = useAccount();
  const [joiningContestId, setJoiningContestId] = useState<number | null>(null);
  const [joiningContest, setJoiningContest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'idle' | 'approving' | 'joining'>('idle');
  const [pendingJoinParams, setPendingJoinParams] = useState<any>(null);

  const { writeContract: writeJoin, data: joinHash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isJoinLoading, isSuccess: isJoinSuccess, isError: isJoinError, error: transactionError } = useWaitForTransactionReceipt({
    hash: joinHash,
  });

  const { approve, approving, isApproveSuccess, approvalAmount, error: approvalError } = useApproveToken();
  const { balance: usdcBalance, isLoading: isBalanceLoading } = useUSDCBalance(address);

  // Reset states when join transaction succeeds
  useEffect(() => {
    if (isJoinSuccess) {
      setJoiningContestId(null);
      setJoiningContest(false);
      setCurrentStep('idle');
      setError(null);
      setPendingJoinParams(null);
      console.log("Join contest transaction confirmed");
    }
  }, [isJoinSuccess]);

  // Handle join transaction errors
  useEffect(() => {
    if (isJoinError && transactionError) {
      setJoiningContestId(null);
      setJoiningContest(false);
      setCurrentStep('idle');
      setError(`Join contest failed`);
      setPendingJoinParams(null);
      console.error('Join contest error:', transactionError);
    }
  }, [isJoinError, transactionError]);

  // Handle write contract errors (user rejection, etc.)
  useEffect(() => {
    if (writeError) {
      setJoiningContestId(null);
      setJoiningContest(false);
      setCurrentStep('idle');
      setError(`Failed to submit join contest`);
      setPendingJoinParams(null);
      console.error('Write contract error:', writeError);
    }
  }, [writeError]);

  // Update joining state based on transaction status
  useEffect(() => {
    if (isWritePending || isJoinLoading) {
      setJoiningContest(true);
      setCurrentStep('joining');
    } else if (isJoinSuccess || isJoinError || writeError) {
      setJoiningContest(false);
      if (isJoinSuccess) {
        setCurrentStep('idle');
      }
    }
  }, [isWritePending, isJoinLoading, isJoinSuccess, isJoinError, writeError]);

  
  // Handle approval success and proceed to join contest
  useEffect(() => {
    if (isApproveSuccess && joiningContest && currentStep === 'approving' && pendingJoinParams) {
      console.log("Approval successful, proceeding to join contest");
      setCurrentStep('joining');
      
      // Join contest with stored parameters
      writeJoin({
        address: CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
        abi: [
          {
            name: 'joinContest',
            type: 'function',
            inputs: [
              { name: 'id', type: 'uint256' },
              { name: 'stakeAmount', type: 'uint256' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'joinContest',
        args: [BigInt(pendingJoinParams.contestId), pendingJoinParams.joinAmount],
      });
    }
  }, [isApproveSuccess, joiningContest, currentStep, pendingJoinParams, writeJoin]);

  // Handle approval errors
  useEffect(() => {
    // Check for approval errors if we have an approval amount and we're in the approving step
    if (approvalAmount > 0n && joiningContest && currentStep === 'approving') {
      // If approval failed (not approving, not successful, and there's an error), handle the error
      if (!approving && !isApproveSuccess && approvalError) {
        setJoiningContestId(null);
        setJoiningContest(false);
        setCurrentStep('idle');
        setError(`Token approval failed`);
        setPendingJoinParams(null);
        console.error('Approval failed:', approvalError);
      }
    }
  }, [approving, isApproveSuccess, approvalAmount, approvalError, joiningContest, currentStep]);


  const handleJoinContest = async (contestId: number | bigint, stake: bigint, odds: bigint) => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    const joinAmount = calculateJoinAmount(stake, odds);
    
    // Check if user has sufficient USDC balance
    if (usdcBalance < joinAmount) {
      setError(`Insufficient USDC balance. You need ${formatUSDC(joinAmount)} USDC but have ${formatUSDC(usdcBalance)} USDC.`);
      return;
    }

    // Clear any previous errors
    setError(null);

    try {
      console.log('Starting join contest process for contest:', contestId);
      setJoiningContestId(Number(contestId));
      setJoiningContest(true);
      setCurrentStep('approving');
      
      // Store join parameters for when approval succeeds
      const joinParams = {
        contestId,
        joinAmount
      };
      setPendingJoinParams(joinParams);
      
      // Always call permit - it will handle allowance internally
      console.log('Starting permit process...');
      await approve(joinAmount);
      console.log('Permit submitted, waiting for confirmation...');
      // The join contest will be triggered automatically when approval succeeds
      // via the useEffect that watches isApproveSuccess
    } catch (error) {
      console.error('Error in join contest process:', error);
      setError('Error joining contest. Please try again.');
      setJoiningContestId(null);
      setJoiningContest(false);
      setCurrentStep('idle');
      setPendingJoinParams(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    handleJoinContest,
    joiningContestId,
    joiningContest,
    isJoinLoading,
    approving,
    isJoinSuccess,
    usdcBalance,
    isBalanceLoading,
    error,
    clearError,
    currentStep,
  };
} 