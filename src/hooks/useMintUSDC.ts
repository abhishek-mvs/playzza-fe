'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS } from '../app/constants';
import { parseUnits } from 'viem';

interface MintStatus {
  lastMintTime: bigint;
  timeUntilNextMint: bigint;
  canMintNow: boolean;
}

export function useMintUSDC() {
  const { address } = useAccount();
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract: writeMint, data: mintHash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isMintLoading, isSuccess: isMintSuccess, isError: isMintError, error: transactionError } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  // Get mint status
  const { data: mintStatus, isLoading: isStatusLoading, refetch: refetchStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
    abi: ABIS.USDC,
    functionName: 'getUserMintingStatus',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });
  console.log("Mint status:", mintStatus);
  // Get mint limit
  const { data: mintLimit, isLoading: isLimitLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
    abi: ABIS.USDC,
    functionName: 'mintLimit',
  });

  // Get minting cooldown
  const { data: mintingCooldown, isLoading: isCooldownLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
    abi: ABIS.USDC,
    functionName: 'mintingCooldown',
  });

  // Reset states when mint transaction succeeds
  useEffect(() => {
    if (isMintSuccess) {
      setMinting(false);
      setError(null);
      refetchStatus();
      console.log("Mint transaction confirmed");
    }
  }, [isMintSuccess, refetchStatus]);

  // Handle mint transaction errors
  useEffect(() => {
    if (isMintError && transactionError) {
      setMinting(false);
      setError(`Mint failed: ${transactionError.message}`);
      console.error('Mint transaction error:', transactionError);
    }
  }, [isMintError, transactionError]);

  // Handle write contract errors (user rejection, etc.)
  useEffect(() => {
    if (writeError) {
      setMinting(false);
      setError(`Failed to submit mint transaction: ${writeError.message}`);
      console.error('Write contract error:', writeError);
    }
  }, [writeError]);

  // Update minting state based on transaction status
  useEffect(() => {
    if (isWritePending || isMintLoading) {
      setMinting(true);
    } else if (isMintSuccess || isMintError || writeError) {
      setMinting(false);
    }
  }, [isWritePending, isMintLoading, isMintSuccess, isMintError, writeError]);

  const mintTokens = async (amount: string = '250') => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    // Check if user can mint
    const status = mintStatus as MintStatus;
    if (status && !status.canMintNow) {
      setError('Cooldown period not completed. Please wait before minting again.');
      return;
    }

    // Check mint limit
    const limit = mintLimit as bigint;
    const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals
    if (limit && amountInWei > limit) {
      setError(`Mint amount exceeds limit of ${limit} wei`);
      return;
    }

    // Clear any previous errors
    setError(null);

    try {
      console.log("Minting tokens:", amount);
      
      writeMint({
        address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
        abi: ABIS.USDC,
        functionName: 'mint',
        args: [address as `0x${string}`, amountInWei],
      });
    } catch (error) {
      console.error('Error minting tokens:', error);
      setError('Error minting tokens. Please try again.');
      setMinting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    mintTokens,
    minting,
    isMintLoading,
    isMintSuccess,
    mintStatus: mintStatus as MintStatus | undefined,
    mintLimit: mintLimit as bigint | undefined,
    mintingCooldown: mintingCooldown as bigint | undefined,
    isStatusLoading,
    isLimitLoading,
    isCooldownLoading,
    error,
    clearError,
    refetchStatus,
  };
} 