export interface TokenConfig {
  dailyLimit: number;
  monthlyLimit: number;
  resetInterval: 'daily' | 'monthly';
}

export const TOKEN_CONFIG: TokenConfig = {
  dailyLimit: 20000, // Reduced to 20k for better safety
  monthlyLimit: 500000,
  resetInterval: 'daily'
};

export const TOKEN_COSTS = {
  SEARCH_PROXY: 100,      // 100 tokens per provider search
  AI_ENHANCE: 250,        // 250 tokens per AI formatting
  AI_SUMMARY: 500,        // 500 tokens per deep summary
  AI_QUALITY_CHECK: 300,  // 300 tokens per quality audit
  AI_GENERATE_IDEA: 400   // 400 tokens per idea generation
};

export const GEMINI_FREE_TIER_LIMITS = {
  requestsPerMinute: 15,
  tokensPerMinute: 1000000,
  requestsPerDay: 1500
};
