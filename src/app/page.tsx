'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
              <span className="text-3xl">🎯</span>
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            <span className="gradient-text">Prediction Market</span>
            <br />
            <span className="text-gray-300 text-4xl">DApp</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            A decentralized prediction market built on Base blockchain where you can create and participate in binary prediction contests with real-time sports data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              Get Started
            </button>
            <button className="px-8 py-4 glass text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="glass rounded-xl p-8 text-center hover:bg-white hover:bg-opacity-10 transition-all duration-300 group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-4">Create Contests</h3>
            <p className="text-gray-400 leading-relaxed">
              Create your own prediction contests with custom questions and betting parameters using real sports data.
            </p>
          </div>

          <div className="glass rounded-xl p-8 text-center hover:bg-white hover:bg-opacity-10 transition-all duration-300 group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">💰</div>
            <h3 className="text-xl font-semibold text-white mb-4">Place Bets</h3>
            <p className="text-gray-400 leading-relaxed">
              Participate in contests by placing bets on binary outcomes using ETH with instant settlement.
            </p>
          </div>

          <div className="glass rounded-xl p-8 text-center hover:bg-white hover:bg-opacity-10 transition-all duration-300 group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🏏</div>
            <h3 className="text-xl font-semibold text-white mb-4">Live Sports</h3>
            <p className="text-gray-400 leading-relaxed">
              View live cricket matches and their details for informed predictions with real-time updates.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="glass rounded-2xl p-10 mb-16">
          <h2 className="text-4xl font-bold text-white mb-10 text-center">
            How It <span className="gradient-text">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Connect Wallet</h3>
              <p className="text-gray-400 leading-relaxed">Connect your MetaMask wallet to the Base network securely</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Create or Join</h3>
              <p className="text-gray-400 leading-relaxed">Create new contests or join existing ones with live sports data</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-pink-500 to-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Win Rewards</h3>
              <p className="text-gray-400 leading-relaxed">Earn ETH rewards for correct predictions with instant payouts</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass rounded-2xl p-10">
          <h2 className="text-4xl font-bold text-white mb-10 text-center">
            Built With <span className="gradient-text">Modern Tech</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h4 className="font-semibold text-white mb-2">Next.js</h4>
              <p className="text-sm text-gray-400">React Framework</p>
            </div>
            <div className="group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔗</div>
              <h4 className="font-semibold text-white mb-2">Base</h4>
              <p className="text-sm text-gray-400">L2 Blockchain</p>
            </div>
            <div className="group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📱</div>
              <h4 className="font-semibold text-white mb-2">Wagmi</h4>
              <p className="text-sm text-gray-400">Web3 React Hooks</p>
            </div>
            <div className="group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
              <h4 className="font-semibold text-white mb-2">Tailwind</h4>
              <p className="text-sm text-gray-400">CSS Framework</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
