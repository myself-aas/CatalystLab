import React from 'react';
import { useAppStore } from '../../store';
import { RefreshCw, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';

export const SyncStatusBadge: React.FC = () => {
  const {
    syncStatus,
    isOnline,
    lastSyncedAt,
    pendingMutations,
    failedMutations,
    lastError,
    retryFailedMutations,
    clearLastError
  } = useAppStore();

  const formatLastSync = (ts: number | null) => {
    if (!ts) return 'Never';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      {!isOnline || syncStatus === 'offline' ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md">
          <WifiOff className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Offline (Queued)</span>
        </div>
      ) : syncStatus === 'syncing' ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-md">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span className="whitespace-nowrap">
            Syncing ({pendingMutations.length} pending)
          </span>
        </div>
      ) : syncStatus === 'error' ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap truncate max-w-[140px]" title={lastError || 'Sync error'}>
            Sync Error
          </span>
          {failedMutations.length > 0 && (
            <button
              onClick={() => retryFailedMutations()}
              className="ml-1 px-1.5 py-0.5 bg-red-500/20 hover:bg-red-500/30 rounded text-xs text-red-300 font-semibold cursor-pointer"
            >
              Retry ({failedMutations.length})
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">MongoDB Atlas: Synced</span>
          {lastSyncedAt && (
            <span className="text-slate-400 text-xs hidden sm:inline">
              ({formatLastSync(lastSyncedAt)})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
