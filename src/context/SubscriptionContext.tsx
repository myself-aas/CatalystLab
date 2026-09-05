import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { SubscriptionPlan, SubscriptionPlanId, UserSubscription } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/pricingData';
import { 
  getUserSubscription, 
  startUserTrial, 
  changeUserSubscription,
  getLocalSubscription,
  saveLocalSubscription 
} from '../lib/firebase';
import { getRateLimitStatus, fetchServerRateLimitStatus, RateLimitStatus } from '../utils/rateLimiter';
import { logger } from '../lib/logger';

interface SubscriptionContextType {
  planId: SubscriptionPlanId;
  currentPlan: SubscriptionPlan;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  trialEndsAt: number | null;
  billingCycle: 'monthly' | 'annual';
  setBillingCycle: (cycle: 'monthly' | 'annual') => void;
  startTrial: (planId?: SubscriptionPlanId) => Promise<boolean>;
  changePlan: (planId: SubscriptionPlanId, billingCycle?: 'monthly' | 'annual') => Promise<boolean>;
  cancelTrial: () => Promise<void>;
  trialModalOpen: boolean;
  targetTrialPlan: SubscriptionPlanId;
  openTrialModal: (planId?: SubscriptionPlanId) => void;
  closeTrialModal: () => void;
  loading: boolean;
  rateLimitStatus: RateLimitStatus;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, login } = useAuth();
  
  const [planId, setPlanId] = useState<SubscriptionPlanId>('free');
  const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(0);
  const [trialEndsAt, setTrialEndsAt] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  const [trialModalOpen, setTrialModalOpen] = useState<boolean>(false);
  const [targetTrialPlan, setTargetTrialPlan] = useState<SubscriptionPlanId>('pro');
  const [loading, setLoading] = useState<boolean>(true);

  // Calculate rate limit status
  const rateLimitStatus = getRateLimitStatus(user, isAdmin, planId, isTrialActive, trialDaysRemaining);

  const calculateTrialState = (sub: UserSubscription | null) => {
    if (!sub) {
      setPlanId('free');
      setIsTrialActive(false);
      setTrialDaysRemaining(0);
      setTrialEndsAt(null);
      return;
    }

    const now = Date.now();
    const hasActiveTrial = sub.status === 'trialing' && sub.trialEndsAt && sub.trialEndsAt > now;
    
    if (hasActiveTrial && sub.trialEndsAt) {
      const msLeft = sub.trialEndsAt - now;
      const daysLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      setPlanId(sub.planId || 'pro');
      setIsTrialActive(true);
      setTrialDaysRemaining(daysLeft);
      setTrialEndsAt(sub.trialEndsAt);
      setBillingCycle(sub.billingCycle || 'monthly');
    } else if (sub.status === 'active' && sub.planId !== 'free') {
      setPlanId(sub.planId);
      setIsTrialActive(false);
      setTrialDaysRemaining(0);
      setTrialEndsAt(null);
      setBillingCycle(sub.billingCycle || 'monthly');
    } else {
      setPlanId('free');
      setIsTrialActive(false);
      setTrialDaysRemaining(0);
      setTrialEndsAt(null);
    }
  };

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      // Check local guest trial if any
      const guestSub = getLocalSubscription('guest_trial');
      calculateTrialState(guestSub);
      setLoading(false);
      return;
    }

    try {
      const sub = await getUserSubscription(user.uid);
      calculateTrialState(sub);
    } catch (err) {
      logger.warn('Could not refresh subscription from cloud:', err);
      const localSub = getLocalSubscription(user.uid);
      calculateTrialState(localSub);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  const openTrialModal = (plan: SubscriptionPlanId = 'pro') => {
    setTargetTrialPlan(plan === 'free' ? 'pro' : plan);
    setTrialModalOpen(true);
  };

  const closeTrialModal = () => {
    setTrialModalOpen(false);
  };

  const startTrial = async (targetPlan: SubscriptionPlanId = 'pro'): Promise<boolean> => {
    const chosenPlan = targetPlan === 'free' ? 'starter' : targetPlan;

    // If not logged in, prompt sign in first.
    if (!user) {
      const signedInUser = await login();
      if (!signedInUser) {
        throw new Error('Sign in was cancelled or could not be completed.');
      }
      const sub = await startUserTrial(signedInUser.uid, signedInUser.email || 'user@catalystlab.tech', chosenPlan);
      calculateTrialState(sub);
      setTrialModalOpen(false);
      await fetchServerRateLimitStatus(signedInUser, chosenPlan, true);
      return true;
    }

    const sub = await startUserTrial(user.uid, user.email || 'user@catalystlab.tech', chosenPlan);
    calculateTrialState(sub);
    setTrialModalOpen(false);
    await fetchServerRateLimitStatus(user, chosenPlan, true);
    return true;
  };

  const changePlan = async (
    newPlanId: SubscriptionPlanId, 
    cycle: 'monthly' | 'annual' = billingCycle
  ): Promise<boolean> => {
    if (!user) {
      const signedInUser = await login();
      if (!signedInUser) {
        throw new Error('Sign in was cancelled or could not be completed.');
      }
      const sub = await changeUserSubscription(signedInUser.uid, signedInUser.email || '', newPlanId, cycle);
      calculateTrialState(sub);
      return true;
    }

    const sub = await changeUserSubscription(user.uid, user.email || '', newPlanId, cycle);
    calculateTrialState(sub);
    return true;
  };

  const cancelTrial = async (): Promise<void> => {
    if (!user) {
      setPlanId('free');
      setIsTrialActive(false);
      setTrialDaysRemaining(0);
      setTrialEndsAt(null);
      return;
    }

    try {
      const sub = await changeUserSubscription(user.uid, user.email || '', 'free');
      calculateTrialState(sub);
    } catch (err) {
      logger.error('Failed to cancel trial:', err);
    }
  };

  const currentPlan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;

  return (
    <SubscriptionContext.Provider
      value={{
        planId,
        currentPlan,
        isTrialActive,
        trialDaysRemaining,
        trialEndsAt,
        billingCycle,
        setBillingCycle,
        startTrial,
        changePlan,
        cancelTrial,
        trialModalOpen,
        targetTrialPlan,
        openTrialModal,
        closeTrialModal,
        loading,
        rateLimitStatus,
        refreshSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
