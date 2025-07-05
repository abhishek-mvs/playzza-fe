'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { NavbarConnectButton } from '../components/ConnectButton';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="w-full h-16 glass border-b border-white border-opacity-10 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Nav Links (Logo + Menu) */}
          <div className="flex items-center space-x-3">
            {/* Hamburger for mobile */}
            <button
              className="sm:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Desktop Nav Links */}
            <div className="hidden sm:flex items-center space-x-2">
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-purple-500 bg-opacity-10 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-purple-500 hover:bg-opacity-10'
                }`}
              >
                🎯 Prediction Market
              </Link>
              <Link 
                href="/matches" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive('/matches') 
                    ? 'bg-purple-500 bg-opacity-10 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-purple-500 hover:bg-opacity-10'
                }`}
              >
                🏏 Matches
              </Link>
              <Link 
                href="/contests" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive('/contests') 
                    ? 'bg-purple-500 bg-opacity-10 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-purple-500 hover:bg-opacity-10'
                }`}
              >
                🏆 Contests
              </Link>
            </div>
          </div>

          {/* Wallet Connect Button */}
          <div className="flex items-center ml-2">
            {isConnected && address && (
              <div className="hidden sm:block text-right mr-3">
                <div className="text-xs text-gray-400">Connected</div>
                <div className="text-sm font-medium text-white">
                  {formatAddress(address!)}
                </div>
              </div>
            )}
            <NavbarConnectButton />
          </div>
        </div>
        {/* Mobile Nav Links Dropdown */}
        {isMenuOpen && (
          <div className="sm:hidden mt-2 bg-black bg-opacity-90 rounded-lg shadow-lg py-2 px-4 flex flex-col space-y-2 animate-fade-in-down">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-purple-500 bg-opacity-10 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-purple-500 hover:bg-opacity-10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🎯 Prediction Market
            </Link>
            <Link 
              href="/matches" 
              className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                isActive('/matches') 
                  ? 'bg-purple-500 bg-opacity-10 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-purple-500 hover:bg-opacity-10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🏏 Matches
            </Link>
            <Link 
              href="/contests" 
              className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                isActive('/contests') 
                  ? 'bg-purple-500 bg-opacity-10 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-purple-500 hover:bg-opacity-10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🏆 Contests
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
