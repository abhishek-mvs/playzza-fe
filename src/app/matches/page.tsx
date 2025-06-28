import LiveMatches from "./LiveMatches";
import UpcomingMatches from "./UpcomingMatches";

export default function Matches() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-6 shadow-2xl">
              <span className="text-2xl">🏏</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Live <span className="gradient-text">Sports Matches</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            View live cricket matches and create prediction contests based on real-time sports data
          </p>
        </div>
        
        <div className="space-y-12">
          <LiveMatches />
          <UpcomingMatches />
        </div>
      </div>
    </div>
  );
}