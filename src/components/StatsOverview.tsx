import React from 'react';
import { Users, DollarSign, Target, TrendingUp } from 'lucide-react';
import { MatchedUser } from '../types';

interface StatsOverviewProps {
  users: MatchedUser[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ users }) => {
  const totalUsers = users.length;
  const totalRevenue = users.reduce((sum, user) => sum + user.totalAmount, 0);
  const totalQuestions = users.reduce((sum, user) => sum + user.totalQuestions, 0);
  const averageAccuracy = users.reduce((sum, user) => sum + user.accuracy, 0) / totalUsers;

  const stats = [
    {
      icon: Users,
      label: 'Active Players',
      value: totalUsers.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `৳${totalRevenue.toFixed(2)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Target,
      label: 'Questions Answered',
      value: totalQuestions.toLocaleString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: TrendingUp,
      label: 'Avg Accuracy',
      value: `${averageAccuracy.toFixed(1)}%`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;