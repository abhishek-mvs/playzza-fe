'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './ui/Button';

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
      <Button
        onClick={() => disconnect()}
        variant="danger"
        icon="🔌"
        className="btn-hover-lift"
      >
        Disconnect Wallet
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      loading={isPending}
      icon="🔗"
      className="btn-hover-lift"
    >
      {isPending ? 'Connecting...' : 'Connect MetaMask'}
    </Button>
  );
} 