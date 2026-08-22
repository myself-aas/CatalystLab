import { StateCreator } from 'zustand';
import { DomainDocument } from '../types';
import { dispatchOptimisticMutation } from '../middleware/mongoSyncMiddleware';
import { AppState } from '../useAppStore';

export interface DomainsSlice {
  domains: DomainDocument[];
  activeDomain: string;
  selectedDomainDetails: DomainDocument | null;
  domainsLoading: boolean;

  // Actions
  setActiveDomain: (domain: string) => void;
  setDomains: (domains: DomainDocument[]) => void;
  addDomainOptimistic: (domainData: Omit<DomainDocument, 'id' | 'createdAt'>) => Promise<void>;
  updateDomainOptimistic: (id: string, updates: Partial<DomainDocument>) => Promise<void>;
  deleteDomainOptimistic: (id: string) => Promise<void>;
  verifyDomainDns: (id: string) => Promise<boolean>;
}

export const createDomainsSlice: StateCreator<
  AppState,
  [],
  [],
  DomainsSlice
> = (set, get) => ({
  domains: [
    {
      id: 'dom_catalystlab',
      domain: 'catalystlab.tech',
      verified: true,
      verificationMethod: 'dns_txt',
      createdAt: Date.now() - 30 * 86400000,
      ownerId: 'usr_default',
      sslValid: true,
      sslDaysRemaining: 84,
      trackingScriptActive: true,
      customScriptProxy: true,
      publicDashboard: false,
      notes: 'Primary production telemetry root'
    },
    {
      id: 'dom_staging',
      domain: 'staging.catalystlab.tech',
      verified: true,
      verificationMethod: 'meta_tag',
      createdAt: Date.now() - 14 * 86400000,
      ownerId: 'usr_default',
      sslValid: true,
      sslDaysRemaining: 72,
      trackingScriptActive: true,
      customScriptProxy: false,
      publicDashboard: true,
      notes: 'Staging CI/CD test environment'
    }
  ],
  activeDomain: 'catalystlab.tech',
  selectedDomainDetails: null,
  domainsLoading: false,

  setActiveDomain: (domain: string) => {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const match = get().domains.find(d => d.domain === cleanDomain);
    set({
      activeDomain: cleanDomain,
      selectedDomainDetails: match || null
    });
  },

  setDomains: (domains: DomainDocument[]) => {
    set({ domains });
  },

  addDomainOptimistic: async (domainData) => {
    const tempId = `dom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDomain: DomainDocument = {
      ...domainData,
      id: tempId,
      createdAt: Date.now(),
      verified: false,
      verificationToken: `catalyst-verify-${Math.random().toString(36).substring(2, 12)}`,
      sslValid: true,
      sslDaysRemaining: 90,
      trackingScriptActive: false
    };

    await dispatchOptimisticMutation(set, get, {
      collection: 'domains',
      actionType: 'insert',
      documentId: tempId,
      payload: newDomain,
      previousState: null,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          domains: [newDomain, ...state.domains],
          activeDomain: newDomain.domain,
          selectedDomainDetails: newDomain
        }));
      }
    });
  },

  updateDomainOptimistic: async (id: string, updates: Partial<DomainDocument>) => {
    const previous = get().domains.find(d => d.id === id);
    if (!previous) return;

    const updated = { ...previous, ...updates, updatedAt: Date.now() };

    await dispatchOptimisticMutation(set, get, {
      collection: 'domains',
      actionType: 'update',
      documentId: id,
      payload: updated,
      previousState: previous,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          domains: state.domains.map(d => d.id === id ? updated : d),
          selectedDomainDetails: state.selectedDomainDetails?.id === id ? updated : state.selectedDomainDetails
        }));
      }
    });
  },

  deleteDomainOptimistic: async (id: string) => {
    const previous = get().domains.find(d => d.id === id);
    if (!previous) return;

    await dispatchOptimisticMutation(set, get, {
      collection: 'domains',
      actionType: 'delete',
      documentId: id,
      payload: previous,
      previousState: previous,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          domains: state.domains.filter(d => d.id !== id),
          activeDomain: state.activeDomain === previous.domain ? 'catalystlab.tech' : state.activeDomain,
          selectedDomainDetails: state.selectedDomainDetails?.id === id ? null : state.selectedDomainDetails
        }));
      }
    });
  },

  verifyDomainDns: async (id: string) => {
    const target = get().domains.find(d => d.id === id);
    if (!target) return false;

    try {
      const res = await fetch('/api/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `https://${target.domain}` })
      });
      const data = await res.json();
      const isReachable = Boolean(data.reachable);

      if (isReachable) {
        await get().updateDomainOptimistic(id, {
          verified: true,
          trackingScriptActive: true,
          sslValid: true
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
});
