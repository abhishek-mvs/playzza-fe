'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🎯 Prediction Market DApp
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A decentralized prediction market built on Base blockchain where you can create and participate in binary prediction contests.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Contests</h3>
            <p className="text-gray-600">
              Create your own prediction contests with custom questions and betting parameters.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Place Bets</h3>
            <p className="text-gray-600">
              Participate in contests by placing bets on binary outcomes using ETH.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🏏</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sports Matches</h3>
            <p className="text-gray-600">
              View live cricket matches and their details for informed predictions.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
              <p className="text-gray-600">Connect your MetaMask wallet to the Base network</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create or Join</h3>
              <p className="text-gray-600">Create new contests or join existing ones</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Win Rewards</h3>
              <p className="text-gray-600">Earn ETH rewards for correct predictions</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Built With</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold">Next.js</h4>
              <p className="text-sm text-gray-600">React Framework</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔗</div>
              <h4 className="font-semibold">Base</h4>
              <p className="text-sm text-gray-600">L2 Blockchain</p>
            </div>
            <div>
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-semibold">Wagmi</h4>
              <p className="text-sm text-gray-600">Web3 React Hooks</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold">Tailwind</h4>
              <p className="text-sm text-gray-600">CSS Framework</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
