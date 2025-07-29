import { useState, useEffect } from 'react';
import { TransactionData, PlayerData, MatchedUser } from '../types';

export const useLeaderboardData = () => {
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [transactionResponse, playerResponse] = await Promise.all([
          fetch('https://ms.purplepatch.online/charging_data/quizard/quizard_24_to_28_bkash_charging_data.json'),
          fetch('https://ms.purplepatch.online/charging_data/quizard/quizard_28_player_raw_data.json')
        ]);

        if (!transactionResponse.ok || !playerResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const transactionData: TransactionData[] = await transactionResponse.json();
        const playerData: PlayerData[] = await playerResponse.json();

        // Process and match data
        const matched = processMatchedUsers(transactionData, playerData);
        setMatchedUsers(matched);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { matchedUsers, loading, error };
};

const processMatchedUsers = (transactions: TransactionData[], players: PlayerData[]): MatchedUser[] => {
  const userMap = new Map<string, MatchedUser>();

  // Group transactions by wallet
  transactions.forEach(transaction => {
    const wallet = transaction.from_wallet;
    const amount = parseFloat(transaction.transaction_amount.replace(/,/g, ''));
    
    if (!userMap.has(wallet)) {
      userMap.set(wallet, {
        msisdn: '',
        wallet,
        totalAmount: 0,
        totalTransactions: 0,
        rightAnswers: 0,
        totalQuestions: 0,
        accuracy: 0,
        timeTaken: 0,
        lastActivity: transaction.date,
        serviceType: 'N/A'
      });
    }

    const user = userMap.get(wallet)!;
    user.totalAmount += amount;
    user.totalTransactions += 1;
  });

  // Group players by msisdn and match with transactions
  const playerMap = new Map<string, PlayerData[]>();
  players.forEach(player => {
    const fullMsisdn = '0' + player.msisdn;
    if (!playerMap.has(fullMsisdn)) {
      playerMap.set(fullMsisdn, []);
    }
    playerMap.get(fullMsisdn)!.push(player);
  });

  // Match users and calculate player stats
  const matchedUsers: MatchedUser[] = [];
  
  userMap.forEach((user, wallet) => {
    if (playerMap.has(wallet)) {
      const playerRecords = playerMap.get(wallet)!;
      
      let totalRightAnswers = 0;
      let totalQuestions = 0;
      let totalTimeTaken = 0;
      let validRecords = 0;
      let lastServiceType = 'N/A';
      let lastActivity = user.lastActivity;

      playerRecords.forEach(record => {
        const rightCount = parseInt(record.right_count) || 0;
        const questionCount = parseInt(record.question_count) || 0;
        const timeTaken = parseInt(record.time_taken) || 0;

        totalRightAnswers += rightCount;
        totalQuestions += questionCount;
        
        if (timeTaken > 0) {
          totalTimeTaken += timeTaken;
          validRecords++;
        }

        if (record.serviceType !== 'N/A') {
          lastServiceType = record.serviceType;
        }

        if (record.created_at > lastActivity) {
          lastActivity = record.created_at;
        }
      });

      const accuracy = totalQuestions > 0 ? (totalRightAnswers / totalQuestions) * 100 : 0;
      const averageTime = validRecords > 0 ? Math.round(totalTimeTaken / validRecords) : 0;

      matchedUsers.push({
        ...user,
        msisdn: wallet.substring(1), // Remove the leading '0'
        rightAnswers: totalRightAnswers,
        totalQuestions,
        accuracy,
        timeTaken: averageTime,
        lastActivity,
        serviceType: lastServiceType
      });
    }
  });

  // Sort by accuracy first, then by total amount
  return matchedUsers.sort((a, b) => {
    if (Math.abs(a.accuracy - b.accuracy) > 0.1) {
      return b.accuracy - a.accuracy;
    }
    return b.totalAmount - a.totalAmount;
  });
};