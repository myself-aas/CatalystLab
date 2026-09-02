import React from 'react';
import { useAppStore } from '../../store';
import { RefreshCw, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export const SyncStatusBadge: React.FC = () => {
  const {
    syncStatus,
    isOnline,
    lastSyncedAt,
    pendingMutations,
    failedMutations,
    lastError,
    retryFailedMutations
  } = useAppStore();

  const formatLastSync = (ts: number | null) => {
    if (!ts) return 'Never';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      {!isOnline || syncStatus === 'offline' ? (
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
          <WifiOff className="size-3" />
          <span className="whitespace-nowrap text-[11px]">Offline (Queued)</span>
        </div>
      ) : syncStatus === 'syncing' ? (
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 border border-accent/30 text-accent-bright rounded-full">
          <RefreshCw className="size-3 animate-spin text-accent-bright" />
          <span className="whitespace-nowrap text-[11px]">
            Syncing ({pendingMutations.length} pending)
          </span>
        </div>
      ) : syncStatus === 'error' ? (
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full">
          <AlertCircle className="size-3" />
          <span className="whitespace-nowrap truncate max-w-[140px] text-[11px]" title={lastError || 'Sync error'}>
            Sync Error
          </span>
          {failedMutations.length > 0 && (
            <button
              onClick={() => retryFailedMutations()}
              className="ml-1 px-1.5 py-0.2 bg-rose-500/20 hover:bg-rose-500/30 rounded text-[10px] text-rose-300 font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              Retry ({failedMutations.length})
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
          <CheckCircle2 className="size-3 text-emerald-400" />
          <span className="whitespace-nowrap text-[11px]">Atlas: Synced</span>
          {lastSyncedAt && (
            <span className="text-foreground-muted text-[10px] hidden sm:inline">
              ({formatLastSync(lastSyncedAt)})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
