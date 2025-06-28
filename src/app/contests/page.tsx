"use client";

import { ContestList } from "@/components/ContestList";
import { useAccount } from "wagmi";
import { useContestsByUser } from "@/hooks/useContests";
import { ConnectButton } from "@/components/ConnectButton";
import { CreateContest } from "@/components/CreateContest";
import { Contest } from "@/types/contest";

export default function Contests() {
  const { isConnected, address } = useAccount();
  const { contest: contests, isLoading, refetch } = useContestsByUser(address || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 My Prediction Contests
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            View and manage your prediction contests on Base
          </p>
          <ConnectButton />
        </div>

        {isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Contest List Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                My Contests
              </h2>
              <ContestList contests={contests as Contest[]} isLoading={isLoading} onContestJoined={refetch} />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your MetaMask wallet to view and manage your prediction contests.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}