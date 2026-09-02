import React, { useState, useEffect } from 'react';
import { Activity, Server, AlertTriangle } from 'lucide-react';

export const SiteMonitoringView: React.FC = () => {
  return (
    <div className="w-full mx-auto p-6 bg-muted text-foreground rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Site Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background border border-border p-6 rounded-xl shadow-sm">
          <Activity className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="font-bold text-lg">System Health</h3>
          <p className="text-2xl font-bold text-emerald-500">100%</p>
        </div>
        <div className="bg-background border border-border p-6 rounded-xl shadow-sm">
          <Server className="w-8 h-8 text-indigo-500 mb-2" />
          <h3 className="font-bold text-lg">Active Nodes</h3>
          <p className="text-2xl font-bold text-foreground">12 / 12</p>
        </div>
        <div className="bg-background border border-border p-6 rounded-xl shadow-sm">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <h3 className="font-bold text-lg">Active Alerts</h3>
          <p className="text-2xl font-bold text-foreground">0</p>
        </div>
      </div>
    </div>
  );
};
