'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS } from '../constants';

export function useApproveToken() {
  const [isApproved, setIsApproved] = useState(false);
  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const approve = async (amount: bigint) => {
    try {
      writeApprove({
        address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
        abi: ABIS.USDC,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`, amount],
      });
      setIsApproved(true);
    } catch (error) {
      console.error('Error approving tokens:', error);
      throw error;
    }
  };

  return {
    approve,
    isApproving,
    isApproved,
  };
} 