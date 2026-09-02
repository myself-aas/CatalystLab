import { StateCreator } from 'zustand';
import { AlertChannelDocument } from '../types';
import { dispatchOptimisticMutation } from '../middleware/mongoSyncMiddleware';
import { AppState } from '../useAppStore';
import { errorMessage } from '../../lib/utils';

export interface AlertsSlice {
  alerts: AlertChannelDocument[];
  alertsLoading: boolean;

  // Actions
  setAlerts: (alerts: AlertChannelDocument[]) => void;
  addAlertChannelOptimistic: (alertData: Omit<AlertChannelDocument, 'id' | 'createdAt'>) => Promise<void>;
  updateAlertChannelOptimistic: (id: string, updates: Partial<AlertChannelDocument>) => Promise<void>;
  deleteAlertChannelOptimistic: (id: string) => Promise<void>;
  testAlertChannel: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const createAlertsSlice: StateCreator<
  AppState,
  [],
  [],
  AlertsSlice
> = (set, get) => ({
  alerts: [
    {
      id: 'alert_slack_01',
      domain: 'catalystlab.tech',
      name: 'DevSecOps Realtime Slack Radar',
      type: 'slack',
      destination: '',
      enabled: true,
      events: ['traffic_spike', 'traffic_drop', 'audit_regression'],
      thresholdDeviationPercent: 50,
      createdAt: Date.now() - 25 * 86400000,
      ownerId: 'usr_default'
    },
    {
      id: 'alert_email_02',
      domain: 'catalystlab.tech',
      name: 'Weekly Performance Digest (Mailgun)',
      type: 'email',
      destination: 'devops-lead@catalystlab.tech',
      enabled: true,
      events: ['traffic_drop', 'ssl_expiry'],
      thresholdDeviationPercent: 75,
      createdAt: Date.now() - 18 * 86400000,
      ownerId: 'usr_default'
    },
    {
      id: 'alert_discord_03',
      domain: 'catalystlab.tech',
      name: 'Incident War-Room Discord Webhook',
      type: 'discord',
      destination: 'https://discord.com/api/webhooks/000000000000000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      enabled: false,
      events: ['uptime_downtime', 'audit_regression'],
      thresholdDeviationPercent: 30,
      createdAt: Date.now() - 10 * 86400000,
      ownerId: 'usr_default'
    }
  ],
  alertsLoading: false,

  setAlerts: (alerts: AlertChannelDocument[]) => {
    set({ alerts });
  },

  addAlertChannelOptimistic: async (alertData) => {
    const tempId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newAlert: AlertChannelDocument = {
      ...alertData,
      id: tempId,
      createdAt: Date.now()
    };

    await dispatchOptimisticMutation(set, get, {
      collection: 'alerts',
      actionType: 'insert',
      documentId: tempId,
      payload: newAlert,
      previousState: null,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          alerts: [newAlert, ...state.alerts]
        }));
      }
    });
  },

  updateAlertChannelOptimistic: async (id: string, updates: Partial<AlertChannelDocument>) => {
    const previous = get().alerts.find(a => a.id === id);
    if (!previous) return;

    const updated = { ...previous, ...updates, updatedAt: Date.now() };

    await dispatchOptimisticMutation(set, get, {
      collection: 'alerts',
      actionType: 'update',
      documentId: id,
      payload: updated,
      previousState: previous,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          alerts: state.alerts.map(a => a.id === id ? updated : a)
        }));
      }
    });
  },

  deleteAlertChannelOptimistic: async (id: string) => {
    const previous = get().alerts.find(a => a.id === id);
    if (!previous) return;

    await dispatchOptimisticMutation(set, get, {
      collection: 'alerts',
      actionType: 'delete',
      documentId: id,
      payload: previous,
      previousState: previous,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          alerts: state.alerts.filter(a => a.id !== id)
        }));
      }
    });
  },

  testAlertChannel: async (id: string) => {
    const alert = get().alerts.find(a => a.id === id);
    if (!alert) return { success: false, message: 'Alert channel not found' };

    try {
      if (alert.type === 'slack') {
        const res = await fetch('/api/notifications/webhook/test-slack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhookUrl: alert.destination, domain: alert.domain })
        });
        const data = await res.json();
        return { success: Boolean(data.success), message: data.message || (data.success ? 'Slack alert delivered' : 'Failed to deliver') };
      } else if (alert.type === 'discord') {
        const res = await fetch('/api/notifications/webhook/test-discord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhookUrl: alert.destination, domain: alert.domain })
        });
        const data = await res.json();
        return { success: Boolean(data.success), message: data.message || (data.success ? 'Discord alert delivered' : 'Failed to deliver') };
      } else if (alert.type === 'email') {
        const res = await fetch('/api/notifications/email/send-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail: alert.destination })
        });
        const data = await res.json();
        return { success: Boolean(data.success), message: data.success ? 'Mailgun test dispatch succeeded' : 'Failed to send test email' };
      }
      return { success: true, message: 'Webhook simulated successfully' };
    } catch (e: unknown) {
      return { success: false, message: errorMessage(e) || 'Dispatch error' };
    }
  }
});
