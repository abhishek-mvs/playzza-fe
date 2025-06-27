"use client";

import { ContestList } from "@/components/ContestList";
import { useAccount } from "wagmi";
import { useContests } from "@/hooks/useContests";
import { ConnectButton } from "@/components/ConnectButton";
import { CreateContest } from "@/components/CreateContest";

export default function Contests() {
    const { isConnected } = useAccount();
  const { contests, isLoading, refetch } = useContests();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Prediction Market
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Create and participate in binary prediction contests on Base
          </p>
          <ConnectButton />
        </div>

        {isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Contest Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Create New Contest
              </h2>
              <CreateContest onContestCreated={refetch} />
            </div>

            {/* Contest List Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Available Contests
              </h2>
              <ContestList contests={contests} isLoading={isLoading} onContestJoined={refetch} />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your MetaMask wallet to start creating and participating in prediction contests.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}