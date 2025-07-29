import { useState, useEffect } from "react";
import { TransactionData, PlayerData, MatchedUser } from "../types";

export const useLeaderboardData = () => {
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
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
        const matched = processMatchedUsers(transactionData, playerData);
        setMatchedUsers(matched);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { matchedUsers, loading, error };
};

const processMatchedUsers = (
  transactions: TransactionData[],
  players: PlayerData[]
): MatchedUser[] => {
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

  // Group players by msisdn
  const playerMap = new Map<string, PlayerData[]>();
  players.forEach((player) => {
    const msisdn = player.msisdn;
    if (!playerMap.has(msisdn)) {
      playerMap.set(msisdn, []);
    }
    playerMap.get(msisdn)!.push(player);
  });

  // Match users: from_wallet should equal '0' + msisdn
  const matchedUsers: MatchedUser[] = [];

  // Iterate through all players and check if their '0' + msisdn matches any from_wallet
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
