import React from 'react';
import { Trophy, Clock, Target, Wallet, Phone } from 'lucide-react';
import { MatchedUser } from '../types';

interface UserCardProps {
  user: MatchedUser;
  rank: number;
}

const UserCard: React.FC<UserCardProps> = ({ user, rank }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-r ${getRankColor(rank)} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2`}>
          <Trophy className="w-4 h-4" />
          {getRankIcon(rank)}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{user.accuracy.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">Accuracy</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-indigo-600" />
          <span className="font-mono text-sm text-gray-700">{user.msisdn}</span>
        </div>

        <div className="flex items-center gap-3">
          <Wallet className="w-4 h-4 text-green-600" />
          <span className="font-mono text-sm text-gray-700">{user.wallet}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
            <p className="text-lg font-bold text-green-700">৳{user.totalAmount.toFixed(2)}</p>
            <p className="text-xs text-green-600">Total Amount</p>
            <p className="text-xs text-gray-500">{user.totalTransactions} transactions</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-blue-600" />
              <p className="text-lg font-bold text-blue-700">{user.rightAnswers}</p>
            </div>
            <p className="text-xs text-blue-600">Correct Answers</p>
            <p className="text-xs text-gray-500">of {user.totalQuestions} questions</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{user.timeTaken}s avg</span>
          </div>
          <div className="text-xs text-gray-500">
            {user.serviceType !== 'N/A' ? user.serviceType : 'General'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;