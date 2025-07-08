'use client';

import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useMintUSDC } from '../../hooks/useMintUSDC';
import { useUSDCBalance } from '../../hooks/useUSDCBalance';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { HeroConnectButton } from '../../components/ConnectButton';

export default function NeedFundsPage() {
  const { isConnected, address } = useAccount();
  const { 
    mintTokens, 
    minting, 
    isMintSuccess, 
    mintStatus, 
    error,
    clearError
  } = useMintUSDC();
  
  const { balance: usdcBalance, isLoading: isBalanceLoading } = useUSDCBalance(address);

  const formatTime = (seconds: bigint) => {
    const totalSeconds = Number(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleMint = () => {
    clearError();
    mintTokens('250');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-start justify-center pt-20">
        <div className="text-center">
          <div className="mb-6">
            <img src="/icons/funds.png" alt="Funds" className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Get USDC Tokens</h1>
          <p className="text-gray-300 mb-8">Connect your wallet to mint USDC tokens</p>
          <HeroConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-start justify-center pt-20">
      <Card variant="glass" className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <img src="/icons/funds.png" alt="Funds" className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-6">Get USDC Tokens</h1>
          
          {/* Current Balance */}
          <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-sm text-gray-400 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-green-400">
              {isBalanceLoading ? 'Loading...' : `${formatUnits(usdcBalance, 6)} USDC`}
            </p>
          </div>

          {/* Minting Status */}
          {mintStatus && (
            <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <p className="text-lg font-semibold text-white mb-2">
                {mintStatus.canMintNow ? '✅ Ready to Mint' : '⏳ Cooldown Active'}
              </p>
              {!mintStatus.canMintNow && (
                <p className="text-sm text-yellow-400">
                  Wait {formatTime(mintStatus.timeUntilNextMint)} before minting again
                </p>
              )}
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {isMintSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 text-sm">✅ Successfully minted 250 USDC!</p>
            </div>
          )}

          {/* Mint Button */}
          <Button
            size="lg"
            onClick={handleMint}
            disabled={minting || (mintStatus && !mintStatus.canMintNow)}
            className="w-full"
            // icon={minting ? "⏳" : "💰"}
          >
            {minting ? 'Minting...' : 'Get 250 USDC'}
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            Get 250 USDC tokens for testing. Cooldown applies between mints.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
