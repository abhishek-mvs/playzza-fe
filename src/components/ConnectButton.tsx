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
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
      >
        <span>🔌</span>
        <span>Disconnect Wallet</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center space-x-2"
    >
      {isPending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <span>🔗</span>
          <span>Connect MetaMask</span>
        </>
      )}
    </button>
  );
} 