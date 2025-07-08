'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWalletClient, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS } from '../app/constants';

export function useApproveToken() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isApproved, setIsApproved] = useState(false);
  const [approvalAmount, setApprovalAmount] = useState<bigint>(0n);
  const [localIsApproving, setLocalIsApproving] = useState(false);
  const [permitReady, setPermitReady] = useState(false);
  
  const { writeContract: writePermit, data: permitHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isTransactionLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: permitHash,
  });

  const chainId = publicClient?.chain.id;
  console.log("Chain ID:", chainId);
  // Combine local approving state with transaction loading state
  const isApproving = localIsApproving || isWritePending || isTransactionLoading;

  // Check current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
    abi: ABIS.USDC,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`],
  });

  // Reset approval state when transaction succeeds
  useEffect(() => {
    if (isApproveSuccess) {
      setIsApproved(true);
      setLocalIsApproving(false);
      setPermitReady(false);
      refetchAllowance(); // Refresh allowance after approval
      console.log("Permit transaction confirmed");
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Reset local approving state if transaction fails or is rejected
  useEffect(() => {
    if (!isWritePending && !isTransactionLoading && localIsApproving && !isApproveSuccess) {
      // If we were locally approving but the transaction is no longer pending and not successful, it likely failed
      setLocalIsApproving(false);
      setPermitReady(false);
    }
  }, [isWritePending, isTransactionLoading, localIsApproving, isApproveSuccess]);

  const generatePermitSignature = async (
    owner: `0x${string}`,
    spender: `0x${string}`,
    value: bigint,
    deadline: bigint
  ) => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet client or public client not available');
    }

    // Get the nonce using public client
    const nonce = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
      abi: ABIS.USDC,
      functionName: 'nonces',
      args: [owner]
    }) as bigint;

    // Sign the typed data
    const signature = await walletClient.signTypedData({
      domain: {
        name: 'Playzza USDC',
        version: '1',
        chainId: chainId, // Base mainnet
        verifyingContract: CONTRACT_ADDRESSES.USDC as `0x${string}`
      },
      types: {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      },
      primaryType: 'Permit',
      message: {
        owner,
        spender,
        value,
        nonce,
        deadline
      }
    });

    // Split signature into v, r, s
    const r = signature.slice(0, 66) as `0x${string}`;
    const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
    const v = parseInt(signature.slice(130, 132), 16);

    return { v, r, s };
  };

  const approve = async (amount: bigint): Promise<void> => {
    if (!address || !walletClient) {
      throw new Error('No wallet address or client available');
    }

    try {
      console.log("Starting permit for amount:", amount.toString());
      setApprovalAmount(amount);
      setIsApproved(false); // Reset approval state
      setLocalIsApproving(true); // Set local approving state immediately
      setPermitReady(false); // Reset permit ready state
      
      // Set deadline to 1 hour from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
      
      // Generate permit signature
      const { v, r, s } = await generatePermitSignature(
        address,
        CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
        amount,
        deadline
      );
      
      // Execute permit
      writePermit({
        address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
        abi: ABIS.USDC,
        functionName: 'permit',
        args: [
          address,
          CONTRACT_ADDRESSES.PREDICTION_CONTEST as `0x${string}`,
          amount,
          deadline,
          v,
          r,
          s
        ],
      });
      
      // Set permit ready to true after the transaction is submitted
      setPermitReady(true);
      
      // Note: We don't set isApproved here - it will be set when transaction is confirmed
    } catch (error) {
      console.error('Error permitting tokens:', error);
      setIsApproved(false);
      setLocalIsApproving(false);
      setPermitReady(false);
      throw error;
    }
  };

  const checkAllowance = (requiredAmount: bigint): boolean => {
    return (currentAllowance as bigint || 0n) >= requiredAmount;
  };

  return {
    approve,
    isApproving,
    isApproved,
    isApproveSuccess,
    approvalAmount,
    currentAllowance: currentAllowance as bigint || 0n,
    checkAllowance,
    refetchAllowance,
    permitReady,
  };
} 