'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="glass border-b border-white border-opacity-10 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
              <span className="text-xl font-bold gradient-text">Prediction Market</span>
            </Link>

            {/* Navigation Links */}
            <div className="md:flex items-center space-x-6">
              <Link 
                href="/matches" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive('/matches') 
                    ? 'bg-white bg-opacity-10 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5'
                }`}
              >
                🏏 Matches
              </Link>
              <Link 
                href="/contests" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive('/contests') 
                    ? 'bg-white bg-opacity-10 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5'
                }`}
              >
                🏆 Contests
              </Link>
            </div>
          </div>

          {/* Wallet Connect Button */}
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-gray-400">Connected</div>
                  <div className="text-sm font-medium text-white">
                    {formatAddress(address!)}
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
