import { NextResponse } from 'next/server';
import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import { adminDb } from '@/lib/firebase-admin';
import { PRICING_PLANS, SubscriptionTier } from '@/lib/pricing';

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: Environment.sandbox, // or Environment.production
});

export async function POST(req: Request) {
  const signature = req.headers.get('paddle-signature') || '';
  const body = await req.text();

  try {
    const event = await paddle.webhooks.unmarshal(body, process.env.PADDLE_WEBHOOK_SECRET!, signature);
    if (!event) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

    switch (event.eventType) {
      case 'subscription.created':
      case 'subscription.updated': {
        const subscription = event.data;
        const userId = subscription.customData?.userId;
        const tier = subscription.customData?.tier as SubscriptionTier;

        if (userId && tier) {
          const plan = PRICING_PLANS[tier];
          const nextReset = new Date();
          nextReset.setMonth(nextReset.getMonth() + 1);

          await adminDb.collection('profiles').doc(userId).update({
            subscription_tier: tier,
            subscription_id: subscription.id,
            customer_id: subscription.customerId,
            subscription_status: subscription.status,
            tokens_remaining: plan.tokensPerMonth,
            tokens_reset_at: adminDb.firestore.Timestamp.fromDate(nextReset)
          });
        }
        break;
      }
      case 'subscription.canceled': {
        const subscription = event.data;
        const userId = subscription.customData?.userId;

        if (userId) {
          await adminDb.collection('profiles').doc(userId).update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            // Keep tokens until reset? Or reset to free tier tokens immediately?
            // Let's reset to free tier tokens
            tokens_remaining: PRICING_PLANS.free.tokensPerMonth
          });
        }
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
