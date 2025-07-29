import React, { useState } from "react";
import { Trophy, Users, Award, ChevronRight } from "lucide-react";
import { useLeaderboardData } from "./hooks/useLeaderboardData";
import LoadingSpinner from "./components/LoadingSpinner";
import StatsOverview from "./components/StatsOverview";
import UserCard from "./components/UserCard";

function App() {
  const { leaderboardData, loading, error } = useLeaderboardData();
  const [activeCategory, setActiveCategory] = useState("150"); // Default to Quiz Tournament

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 mb-4">
            <Award className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const currentCategory = leaderboardData.categories.find(
    (cat) => cat.id === activeCategory
  );
  const currentLeaderboard = leaderboardData.leaderboards[activeCategory] || [];

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
                <h1 className="text-3xl font-bold text-gray-900">
                  Quizard Leaderboards
                </h1>
                <p className="text-gray-600 mt-1">
                  Multiple quiz categories with transaction history
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-700">
                {leaderboardData.totalUsers} Total Players
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {leaderboardData.categories.map((category) => {
              const userCount =
                leaderboardData.leaderboards[category.id]?.length || 0;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold">{category.name}</div>
                      <div className="text-xs text-gray-500">
                        {userCount} players
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentCategory && (
          <div className="mb-8">
            <div
              className={`bg-gradient-to-r ${currentCategory.color} text-white p-6 rounded-xl shadow-lg`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{currentCategory.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">{currentCategory.name}</h2>
                  <p className="text-white/90">{currentCategory.description}</p>
                  <p className="text-white/80 text-sm mt-1">
                    {currentLeaderboard.length} players • Event ID:{" "}
                    {currentCategory.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentLeaderboard.length > 0 ? (
          <>
            <StatsOverview users={currentLeaderboard} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentLeaderboard.map((user, index) => (
                <UserCard
                  key={`${user.wallet}-${user.eventId}`}
                  user={user}
                  rank={index + 1}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
              <span className="text-6xl mb-4 block">
                {currentCategory?.icon || "🏆"}
              </span>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Players Found
              </h3>
              <p className="text-gray-500">
                No players found for {currentCategory?.name || "this category"}{" "}
                with matching wallet and phone number data.
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
