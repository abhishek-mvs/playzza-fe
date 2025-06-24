'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function ConnectButton() {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const connector = connectors[0]; // MetaMask connector
    if (connector) {
      connect({ connector });
    }
  };

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
      >
        Disconnect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
    >
      {isPending ? 'Connecting...' : 'Connect MetaMask'}
    </button>
  );
} 