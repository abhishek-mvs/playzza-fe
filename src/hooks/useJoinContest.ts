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

  const { writeContract: writeJoin, data: joinHash } = useWriteContract();
  const { isLoading: isJoinLoading, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinHash,
  });

  const { approve, isApproving, isApproved, checkAllowance } = useApproveToken();
  const { balance: usdcBalance, isLoading: isBalanceLoading } = useUSDCBalance(address);

  // Reset states when join transaction succeeds
  useEffect(() => {
    if (isJoinSuccess) {
      setJoiningContestId(null);
      setJoiningContest(false);
      console.log("Join contest transaction confirmed");
    }
  }, [isJoinSuccess]);

  const handleJoinContest = async (contestId: number | bigint, stake: bigint, odds: bigint) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    const joinAmount = calculateJoinAmount(stake, odds);
    
    // Check if user has sufficient USDC balance
    if (usdcBalance < joinAmount) {
      alert(`Insufficient USDC balance. You need ${formatUSDC(joinAmount)} USDC but have ${formatUSDC(usdcBalance)} USDC.`);
      return;
    }

    try {
      setJoiningContestId(Number(contestId));
      setJoiningContest(true);
      
      // Step 1: Check if approval is needed
      const hasSufficientAllowance = checkAllowance(joinAmount);
      
      if (!hasSufficientAllowance) {
        // Step 2: Approve tokens (this will wait for confirmation)
        console.log('Starting permit process...');
        await approve(joinAmount);
        console.log('Permit confirmed, executing join transaction...');
      } else {
        console.log('Sufficient allowance exists, proceeding with join...');
      }
      
      // Step 3: Execute join transaction
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
        args: [BigInt(contestId), joinAmount],
      });
    } catch (error) {
      console.error('Error joining contest:', error);
      alert('Error joining contest. Please try again.');
      setJoiningContestId(null);
      setJoiningContest(false);
    }
  };

  return {
    handleJoinContest,
    joiningContestId,
    joiningContest,
    isJoinLoading,
    isApproving,
    isJoinSuccess,
    usdcBalance,
    isBalanceLoading,
  };
} 