'use client';

import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings2, 
  Info, 
  Zap, 
  Clock, 
  Users, 
  MessageSquare, 
  FileText, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Download,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AlgorithmPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['feed-preferences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feed_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async (newPrefs: any) => {
      const { error } = await supabase
        .from('feed_preferences')
        .update(newPrefs)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-preferences'] });
      toast.success('Algorithm settings updated');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const handleSliderChange = (key: string, value: number[]) => {
    updateMutation.mutate({ [key]: value[0] });
  };

  const handleToggleChange = (key: string, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Your Feed, Your Rules</h1>
        <p className="text-slate-400">Catalyst shows you exactly how your feed is built and lets you control every factor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-10">
          <section className="space-y-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5" /> Ranking Weights
            </h2>
            
            <div className="space-y-8">
              {[
                { label: 'Topic Relevance', key: 'topic_weight', icon: Zap },
                { label: 'Recency', key: 'recency_weight', icon: Clock },
                { label: 'Network (Following)', key: 'network_weight', icon: Users },
                { label: 'Engagement', key: 'engagement_weight', icon: MessageSquare },
                { label: 'Paper Content', key: 'paper_weight', icon: FileText },
              ].map((item) => (
                <div key={item.key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-300">
                      <item.icon className="w-4 h-4 text-indigo-400" /> {item.label}
                    </div>
                    <span className="text-xs font-black text-indigo-400">{prefs?.[item.key]?.toFixed(1)}x</span>
                  </div>
                  <Slider 
                    defaultValue={[prefs?.[item.key] || 1.0]} 
                    max={2.0} 
                    min={0.1} 
                    step={0.1} 
                    onValueChange={(val) => handleSliderChange(item.key, val)}
                    className="[&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <section className="space-y-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Content Controls
            </h2>
            
            <div className="space-y-6">
              {[
                { label: 'Show AI Picks', key: 'show_ai_picks', icon: Sparkles },
                { label: 'Show Trending Content', key: 'show_trending', icon: Zap },
                { label: 'AI Noise Filter', key: 'noise_filter', icon: ShieldCheck },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-6 bg-[var(--bg-surface)] border-[var(--border)] rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-slate-300">{item.label}</span>
                  </div>
                  <Switch 
                    checked={prefs?.[item.key]} 
                    onCheckedChange={(val) => handleToggleChange(item.key, val)}
                    className="data-[state=checked]:bg-indigo-500"
                  />
                </div>
              ))}
            </div>
          </section>

          <Card className="p-8 bg-indigo-500/5 border-indigo-500/10 rounded-[32px] space-y-6">
            <div className="flex items-center gap-3 text-indigo-400">
              <Info className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Data Ownership</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Catalyst believes you own your data. Export your entire feed history, network graph, and saved items as a structured JSON file at any time.
            </p>
            <Button variant="outline" className="w-full border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 rounded-xl font-black uppercase tracking-widest text-[10px] py-6">
              <Download className="w-4 h-4 mr-2" /> Export My Data
            </Button>
          </Card>
        </div>
      </div>

      <div className="p-12 bg-[var(--bg-surface)] border-[var(--border)] rounded-[40px] text-center">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Why did I see this?</h3>
        <p className="text-slate-500 max-w-xl mx-auto mb-8">
          Every post on your feed includes a transparency indicator. Click the &quot;Why?&quot; button on any post to see exactly which ranking factors contributed to its position.
        </p>
        <div className="flex justify-center gap-4">
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Topic Match +50
          </div>
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Network +30
          </div>
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Recency +20
          </div>
        </div>
      </div>
    </div>
  );
}
