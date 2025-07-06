'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/matches');
  };

  const handleLearnMore = () => {
    // Scroll to the "How It Works" section
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            <span className="gradient-text">Pikka</span>
            
          </h1>
       
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              icon="🚀"
              className="btn-hover-lift"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              icon="📚"
              className="btn-hover-lift"
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card variant="glass" hover={true} className="card-hover">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🏆</div>
              <h3 className="text-xl font-semibold text-white mb-4">Create Contests</h3>
              <p className="text-gray-400 leading-relaxed">
                Create your own prediction contests with custom questions and betting parameters using real sports data.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" hover={true} className="card-hover">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">💰</div>
              <h3 className="text-xl font-semibold text-white mb-4">Place Bets</h3>
              <p className="text-gray-400 leading-relaxed">
                Participate in contests by placing bets on binary outcomes using ETH with instant settlement.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" hover={true} className="card-hover">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🏏</div>
              <h3 className="text-xl font-semibold text-white mb-4">Live Sports</h3>
              <p className="text-gray-400 leading-relaxed">
                View live cricket matches and their details for informed predictions with real-time updates.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced How It Works */}
        <Card variant="glass" className="mb-16" id="how-it-works">
          <CardContent className="p-10">
            <h2 className="text-4xl font-bold text-white mb-10 text-center">
              How It <span className="gradient-text">Works</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center group">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-pulse-glow">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Connect Wallet</h3>
                <p className="text-gray-400 leading-relaxed">Connect your MetaMask wallet to the Base network securely</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-pulse-glow" style={{ animationDelay: '0.5s' }}>
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Create or Join</h3>
                <p className="text-gray-400 leading-relaxed">Create new contests or join existing ones with live sports data</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-pink-500 to-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-pulse-glow" style={{ animationDelay: '1s' }}>
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Win Rewards</h3>
                <p className="text-gray-400 leading-relaxed">Earn USDC rewards for correct predictions with instant payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
