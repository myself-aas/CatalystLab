# Paddle Subscription & Token System Setup

Catalyst now includes a token-based subscription system integrated with Paddle.

## 1. Supabase Database Update
Run the following SQL in your Supabase SQL Editor to add the necessary columns to the `profiles` table:

```sql
-- Update profiles table with subscription and token fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS tokens_remaining integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS customer_id text,
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS tokens_reset_at timestamptz DEFAULT now();

-- Create a trigger to reset tokens for new users
-- (Already handled by the handle_new_user function if you update it)
```

## 2. Paddle Setup
1. Create a Paddle account (Sandbox for testing: [sandbox-vendors.paddle.com](https://sandbox-vendors.paddle.com)).
2. Create two Subscription Plans (Products):
   - **Pro**: $19/month
   - **Researcher**: $49/month
3. Get your **Price IDs** for these plans.
4. Get your **Client Token** (Developer Tools > Authentication).
5. Get your **API Key** (Developer Tools > Authentication).
6. Set up a **Webhook** (Developer Tools > Webhooks):
   - URL: `https://your-app-url.run.app/api/webhooks/paddle`
   - Events: `subscription.created`, `subscription.updated`, `subscription.canceled`.
   - Get the **Webhook Secret**.

## 3. Environment Variables
Add these to your AI Studio settings (and `.env.local`):

```env
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token
PADDLE_API_KEY=your_api_key
PADDLE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_PADDLE_PRO_PRICE_ID=your_pro_price_id
NEXT_PUBLIC_PADDLE_RESEARCHER_PRICE_ID=your_researcher_price_id
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 4. How it Works
- **Tokens**: Users consume tokens for AI actions (Search, TL;DR, Summarize, etc.).
- **Free Tier**: 10 tokens/month.
- **Pro Tier**: 500 tokens/month.
- **Researcher Tier**: 10,000 tokens/month.
- **Reset**: Tokens reset automatically every 30 days based on `tokens_reset_at`.
- **Enforcement**: All AI API routes now check `checkAndDecrementTokens` before execution.
```
