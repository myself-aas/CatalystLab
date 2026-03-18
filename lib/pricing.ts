export type SubscriptionTier = 'free' | 'pro' | 'researcher';

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  tokensPerMonth: number;
  features: string[];
  paddlePriceId: string; // Paddle Price ID
}

export const PRICING_PLANS: Record<SubscriptionTier, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    tokensPerMonth: 10, // 10 AI searches/month
    features: [
      '5 AI searches per day',
      '10 TL;DRs per day',
      'Basic citation graph',
      'Community access'
    ],
    paddlePriceId: ''
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 19,
    tokensPerMonth: 500,
    features: [
      '500 AI searches per month',
      'Unlimited TL;DRs',
      'Full citation graph (D3)',
      'Advanced AI insights',
      'Priority support'
    ],
    paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || 'pri_01h...'
  },
  researcher: {
    id: 'researcher',
    name: 'Researcher',
    price: 49,
    tokensPerMonth: 10000, // Effectively unlimited
    features: [
      'Unlimited AI searches',
      'Unlimited TL;DRs',
      'Early access to new models',
      'Collaboration matching priority',
      'Data export (JSON/CSV)',
      'Custom knowledge collections'
    ],
    paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_RESEARCHER_PRICE_ID || 'pri_01h...'
  }
};
