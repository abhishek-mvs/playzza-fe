'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWalletClient, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS } from '../app/constants';

export function useApproveToken() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [approvalAmount, setApprovalAmount] = useState<bigint>(0n);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { writeContract: writePermit, data: permitHash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isTransactionLoading, isSuccess: isApproveSuccess, isError: isApproveError, error: transactionError } = useWaitForTransactionReceipt({
    hash: permitHash,
  });

  const chainId = publicClient?.chain.id;

  // Reset approval state when transaction succeeds
  useEffect(() => {
    if (isApproveSuccess) {
      setApproving(false);
      setError(null);
      console.log("Permit transaction confirmed");
    }
  }, [isApproveSuccess]);

  // Handle transaction errors
  useEffect(() => {
    if (isApproveError && transactionError) {
      setApproving(false);
      setError(`Transaction failed: ${transactionError.message}`);
      console.error('Transaction error:', transactionError);
    }
  }, [isApproveError, transactionError]);

  // Handle write contract errors (user rejection, etc.)
  useEffect(() => {
    if (writeError) {
      setApproving(false);
      setError(`Failed to submit transaction: ${writeError.message}`);
      console.error('Write contract error:', writeError);
    }
  }, [writeError]);

  // Update approving state based on transaction status
  useEffect(() => {
    if (isWritePending || isTransactionLoading) {
      setApproving(true);
    } else if (isApproveSuccess || isApproveError || writeError) {
      setApproving(false);
    }
  }, [isWritePending, isTransactionLoading, isApproveSuccess, isApproveError, writeError]);

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

    // Clear any previous errors
    setError(null);

    try {
      console.log("Starting permit for amount:", amount.toString());
      setApprovalAmount(amount);
      
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
      
      // Note: isApproveSuccess will be set when transaction is confirmed
    } catch (error) {
      console.error('Error permitting tokens:', error);
      setApproving(false);
      setError('Error permitting tokens. Please try again.');
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    approve,
    approving,
    isApproveSuccess,
    approvalAmount,
    error,
    clearError,
  };
} 