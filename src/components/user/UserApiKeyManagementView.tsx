import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiKeys } from '../../lib/firebase';
import { ApiKey } from '../../types';
import { Key, Plus, Copy, Trash2, ShieldCheck, Activity } from 'lucide-react';
import { SkeletonTable } from '../skeleton';

export const UserApiKeyManagementView: React.FC = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getApiKeys(user.uid)
        .then(setKeys)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-muted text-foreground rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">API Keys</h2>
          <p className="ds-muted text-sm mt-1">Manage programmatic access to CatalystLab endpoints.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors">
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={3} columns={4} />
      ) : keys.length === 0 ? (
        <div className="text-center p-12 bg-background border border-border rounded-2xl shadow-sm">
          <Key className="w-12 h-12 ds-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold ds-muted">No API Keys</h3>
          <p className="ds-muted mt-2 max-w-md mx-auto">Generate a secure token to authenticate your backend servers or CI/CD pipelines.</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-none touch-pan-x bg-background border border-border rounded-2xl shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted border-b border-border ds-muted ds-eyebrow">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Key Name</th>
                <th className="px-6 py-4">Environment</th>
                <th className="px-6 py-4">Last Used</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keys.map(key => (
                <tr key={key.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {key.name}
                  </td>
                  <td className="px-6 py-4 ds-muted">
                    <span className="px-2.5 py-1 rounded-md bg-accent text-xs font-medium">{key.environment}</span>
                  </td>
                  <td className="px-6 py-4 ds-muted">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-1.5 ds-muted hover:ds-muted bg-muted hover:bg-accent rounded-md transition-colors"><Copy className="w-4 h-4" /></button>
                    <button className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
