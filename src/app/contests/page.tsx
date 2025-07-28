"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import { useAccount } from "wagmi";
import { useContestsByUser } from "@/hooks/useContests";

// Dynamically import components that use wagmi to prevent SSR issues
const ContestList = dynamic(() => import("@/components/UserContestList").then(mod => ({ default: mod.ContestList })), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
      <p className="text-gray-400 text-lg">Loading...</p>
    </div>
  )
});

const HeroConnectButton = dynamic(() => import("@/components/ConnectButton").then(mod => ({ default: mod.HeroConnectButton })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg animate-pulse"></div>
  )
});

// Client-side only wrapper component
const ClientOnlyWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
        <p className="text-gray-400 text-lg">Initializing...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default function Contests() {
  return (
    <ClientOnlyWrapper>
      <ContestsContent />
    </ClientOnlyWrapper>
  );
}

function ContestsContent() {
  const { isConnected, address } = useAccount();
  const { contests: contests, isLoading, refetch } = useContestsByUser(address || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {isConnected ? (
          <div className="w-full max-w-8xl mx-auto gap-8">
            {/* Contest List Section */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <img src="/icons/stackBoxes.png" alt="Contests" className="w-7 h-7 mr-1" />
                My Contests
              </h2>
              <ContestList 
                contests={contests || []} 
                isLoading={isLoading} 
                onContestCancelled={refetch} 
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="glass rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔗</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Connect your MetaMask wallet to view and manage your prediction contests.
              </p>
              <HeroConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}