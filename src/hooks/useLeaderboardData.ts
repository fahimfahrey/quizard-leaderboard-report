import { useState, useEffect } from "react";
import {
  TransactionData,
  PlayerData,
  MatchedUser,
  LeaderboardData,
  QuizCategory,
} from "../types";

const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: "150",
    name: "Quiz Tournament",
    description: "Competitive quiz tournament",
    color: "from-purple-500 to-purple-700",
    icon: "🏆",
  },
  {
    id: "149",
    name: "BCS Quiz",
    description: "Bangladesh Civil Service preparation",
    color: "from-green-500 to-green-700",
    icon: "📚",
  },
  {
    id: "75",
    name: "Sports Quiz",
    description: "Sports knowledge challenge",
    color: "from-blue-500 to-blue-700",
    icon: "⚽",
  },
  {
    id: "34",
    name: "Quiz Protidin",
    description: "Daily quiz challenge",
    color: "from-orange-500 to-orange-700",
    icon: "📅",
  },
];

export const useLeaderboardData = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    categories: QUIZ_CATEGORIES,
    leaderboards: {},
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [transactionResponse, playerResponse] = await Promise.all([
          fetch(
            "https://ms.purplepatch.online/charging_data/quizard/quizard_24_to_28_bkash_charging_data.json"
          ),
          fetch(
            "https://ms.purplepatch.online/charging_data/quizard/quizard_28_player_raw_data.json"
          ),
        ]);

        if (!transactionResponse.ok || !playerResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const transactionData: TransactionData[] =
          await transactionResponse.json();
        const playerData: PlayerData[] = await playerResponse.json();

        // Process and match data
        const leaderboards = processMatchedUsersByCategory(
          transactionData,
          playerData
        );
        const totalUsers = Object.values(leaderboards).reduce(
          (sum, users) => sum + users.length,
          0
        );

        setLeaderboardData({
          categories: QUIZ_CATEGORIES,
          leaderboards,
          totalUsers,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { leaderboardData, loading, error };
};

const processMatchedUsersByCategory = (
  transactions: TransactionData[],
  players: PlayerData[]
): Record<string, MatchedUser[]> => {
  // Group transactions by wallet
  const transactionMap = new Map<
    string,
    {
      totalAmount: number;
      totalTransactions: number;
      lastActivity: string;
    }
  >();

  transactions.forEach((transaction) => {
    const wallet = transaction.from_wallet;
    const amount = parseFloat(transaction.transaction_amount.replace(/,/g, ""));

    if (!transactionMap.has(wallet)) {
      transactionMap.set(wallet, {
        totalAmount: 0,
        totalTransactions: 0,
        lastActivity: transaction.date,
      });
    }

    const transactionData = transactionMap.get(wallet)!;
    transactionData.totalAmount += amount;
    transactionData.totalTransactions += 1;

    // Update last activity if this transaction is more recent
    if (transaction.date > transactionData.lastActivity) {
      transactionData.lastActivity = transaction.date;
    }
  });

  // Group players by event_id and msisdn
  const playersByEvent = new Map<string, Map<string, PlayerData[]>>();

  players.forEach((player) => {
    const eventId = player.event_id;
    const msisdn = player.msisdn;

    if (!playersByEvent.has(eventId)) {
      playersByEvent.set(eventId, new Map<string, PlayerData[]>());
    }

    const eventPlayerMap = playersByEvent.get(eventId)!;
    if (!eventPlayerMap.has(msisdn)) {
      eventPlayerMap.set(msisdn, []);
    }
    eventPlayerMap.get(msisdn)!.push(player);
  });

  // Create leaderboards for each event category
  const leaderboards: Record<string, MatchedUser[]> = {};

  // Initialize empty arrays for all known categories
  QUIZ_CATEGORIES.forEach((category) => {
    leaderboards[category.id] = [];
  });

  // Process each event's players
  playersByEvent.forEach((playerMap, eventId) => {
    // Only process if it's one of our known categories
    if (!QUIZ_CATEGORIES.find((cat) => cat.id === eventId)) {
      return;
    }

    const matchedUsers: MatchedUser[] = [];

    // Match users: from_wallet should equal '0' + msisdn
    playerMap.forEach((playerRecords, msisdn) => {
      const expectedWallet = "0" + msisdn; // Create the expected wallet format
      const transactionData = transactionMap.get(expectedWallet);

      if (transactionData) {
        // We found a match! Calculate player stats
        let totalRightAnswers = 0;
        let totalQuestions = 0;
        let totalTimeTaken = 0;
        let validRecords = 0;
        let lastServiceType = "N/A";
        let lastActivity = transactionData.lastActivity;

        playerRecords.forEach((record) => {
          const rightCount = parseInt(record.right_count) || 0;
          const questionCount = parseInt(record.question_count) || 0;
          const timeTaken = parseInt(record.time_taken) || 0;

          totalRightAnswers += rightCount;
          totalQuestions += questionCount;

          if (timeTaken > 0) {
            totalTimeTaken += timeTaken;
            validRecords++;
          }

          if (record.serviceType && record.serviceType !== "N/A") {
            lastServiceType = record.serviceType;
          }

          if (record.created_at > lastActivity) {
            lastActivity = record.created_at;
          }
        });

        const accuracy =
          totalQuestions > 0 ? (totalRightAnswers / totalQuestions) * 100 : 0;
        const averageTime =
          validRecords > 0 ? Math.round(totalTimeTaken / validRecords) : 0;

        matchedUsers.push({
          msisdn: msisdn,
          wallet: expectedWallet,
          totalAmount: transactionData.totalAmount,
          totalTransactions: transactionData.totalTransactions,
          rightAnswers: totalRightAnswers,
          totalQuestions,
          accuracy,
          timeTaken: averageTime,
          lastActivity,
          serviceType: lastServiceType,
          eventId: eventId,
        });
      }
    });

    // Sort by accuracy first, then by total amount
    matchedUsers.sort((a, b) => {
      if (Math.abs(a.accuracy - b.accuracy) > 0.1) {
        return b.accuracy - a.accuracy;
      }
      return b.totalAmount - a.totalAmount;
    });

    leaderboards[eventId] = matchedUsers;
  });

  return leaderboards;
};
