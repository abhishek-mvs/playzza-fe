"use client";

import { ContestList } from "@/components/UserContestList";
import { useAccount } from "wagmi";
import { useContestsByUser } from "@/hooks/useContests";
import { HeroConnectButton } from "@/components/ConnectButton";

export default function Contests() {
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