import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getConnectedGithubRepos, getGithubTelemetryEvents } from '../../lib/firebase';
import { GithubRepo, GithubTelemetryEvent } from '../../types';
import { GitBranch, Plus, Trash2, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { SkeletonCard } from '../skeleton';

export const UserGithubWebhookView: React.FC = () => {
  const { user } = useAuth();
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getConnectedGithubRepos(user.uid)
        .then(setRepos)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-muted text-foreground rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">GitHub Webhooks</h2>
          <p className="text-muted-foreground text-sm mt-1">Connect repositories for automated CI/CD audits.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors">
          <Plus className="w-4 h-4" />
          Add Repository
        </button>
      </div>

      {loading ? (
        <div className="space-y-4" role="status" aria-label="Loading connected repositories...">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center p-12 bg-background border border-border rounded-2xl shadow-sm">
          <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-muted-foreground">No Repositories Connected</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">Configure your first GitHub webhook to trigger automated audits on every pull request.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {repos.map(repo => (
            <motion.div key={repo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-5 bg-background border border-border rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{repo.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Active Webhook
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-muted-foreground hover:text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
