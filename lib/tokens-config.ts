export interface TokenConfig {
  dailyLimit: number;
  monthlyLimit: number;
  resetInterval: 'daily' | 'monthly';
}

export const TOKEN_CONFIG: TokenConfig = {
  dailyLimit: 50000, // 50k tokens per day
  monthlyLimit: 1000000, // 1M tokens per month
  resetInterval: 'daily'
};

export const GEMINI_FREE_TIER_LIMITS = {
  requestsPerMinute: 15,
  tokensPerMinute: 1000000,
  requestsPerDay: 1500
};
