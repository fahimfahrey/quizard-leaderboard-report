import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading leaderboard data...</p>
        <p className="text-sm text-gray-500 mt-2">Fetching and matching user records</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;