import React from 'react';
import { Trophy, Users, Award } from 'lucide-react';
import { useLeaderboardData } from './hooks/useLeaderboardData';
import LoadingSpinner from './components/LoadingSpinner';
import StatsOverview from './components/StatsOverview';
import UserCard from './components/UserCard';

function App() {
  const { matchedUsers, loading, error } = useLeaderboardData();

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 mb-4">
            <Award className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quizard Leaderboard</h1>
                <p className="text-gray-600 mt-1">Top performers with transaction history</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-700">{matchedUsers.length} Players</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {matchedUsers.length > 0 ? (
          <>
            <StatsOverview users={matchedUsers} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedUsers.map((user, index) => (
                <UserCard 
                  key={user.wallet} 
                  user={user} 
                  rank={index + 1} 
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Matched Users Found</h3>
              <p className="text-gray-500">
                No users found with matching wallet and phone number data.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Data updated in real-time from Quizard platform
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Transactions: 24-28 July 2025</span>
              <span>•</span>
              <span>Player Data: 28 July 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;