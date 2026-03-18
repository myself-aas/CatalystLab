import { Pricing } from '@/components/Pricing';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';

export default function PricingPage() {
  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar title="Pricing & Subscription" />
        
        <div className="flex-1 overflow-y-auto p-8 pb-24">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-[var(--text-secondary)] text-lg">
              Unlock the full power of AI-driven research with our flexible subscription tiers.
            </p>
          </div>

          <Pricing />

          <div className="max-w-4xl mx-auto mt-16 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="font-bold mb-2">What are tokens?</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Tokens are used for AI-powered features like semantic search, paper summarization, and research gap detection. Each AI action typically consumes 1 token.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Can I cancel anytime?</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Yes, you can cancel your subscription at any time from your account settings. You&apos;ll retain access to your plan&apos;s features until the end of your billing cycle.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Do tokens roll over?</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  No, tokens reset at the start of each billing cycle. This ensures you always have a fresh supply of AI power every month.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">What happens if I run out of tokens?</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  If you run out of tokens, you can upgrade to a higher tier or wait until your tokens reset at the start of your next billing cycle.
                </p>
              </div>
            </div>
          </div>
        </div>

        <BottomNav />
      </main>
    </div>
  );
}
