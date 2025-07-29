export interface TransactionData {
  date: string;
  from_wallet: string;
  to_wallet: string;
  transaction_type: string;
  channel: string;
  transaction_amount: string;
  amount_credited: string;
  charges: string;
  transaction_ID: string;
  transaction_reference: string;
  coupon_amount: string;
  amount_after_coupon_discount: string;
  cashback_amount: string;
  transaction_status: string;
}

export interface PlayerData {
  id: string;
  msisdn: string;
  time_taken: string;
  round_number: string;
  right_count: string;
  event_id: string;
  date: string;
  created_at: string;
  sync: string;
  updated_at: string;
  question_count: string;
  round_questions: string;
  paymentStatus: string;
  amount: string;
  payer: string;
  serviceType: string;
  portal_id: string;
}

export interface MatchedUser {
  msisdn: string;
  wallet: string;
  totalAmount: number;
  totalTransactions: number;
  rightAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  lastActivity: string;
  serviceType: string;
  eventId: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface LeaderboardData {
  categories: QuizCategory[];
  leaderboards: Record<string, MatchedUser[]>;
  totalUsers: number;
}
