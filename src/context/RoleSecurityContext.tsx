import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';
import { 
  UserRole, 
  AppPermission, 
  RoleConfig, 
  ROLE_CONFIGS, 
  resolveUserRole, 
  hasPermission as checkPermission,
  checkRouteAccess
} from '../utils/rolePermissions';
import { logger } from '../lib/logger';

interface RoleSecurityContextType {
  actualRole: UserRole;
  simulatedRole: UserRole | null;
  effectiveRole: UserRole;
  roleConfig: RoleConfig;
  isSimulating: boolean;
  setSimulatedRole: (role: UserRole | null) => void;
  resetSimulation: () => void;
  hasPermission: (permission: AppPermission) => boolean;
  canAccessRoute: (pathname: string) => { allowed: boolean; reason?: string; requiredRole?: UserRole; requiredPlan?: string };
}

const RoleSecurityContext = createContext<RoleSecurityContextType>({
  actualRole: 'anonymous',
  simulatedRole: null,
  effectiveRole: 'anonymous',
  roleConfig: ROLE_CONFIGS.anonymous,
  isSimulating: false,
  setSimulatedRole: () => {},
  resetSimulation: () => {},
  hasPermission: () => false,
  canAccessRoute: () => ({ allowed: true })
});

const ROLE_SIMULATION_KEY = 'catalyst_simulated_role';

export const RoleSecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const { planId, isTrialActive } = useSubscription();

  const [simulatedRole, setSimulatedRoleState] = useState<UserRole | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(ROLE_SIMULATION_KEY);
      if (stored && ['anonymous', 'user', 'starter', 'pro', 'team', 'enterprise', 'superadmin'].includes(stored)) {
        return stored as UserRole;
      }
      return null;
    } catch {
      return null;
    }
  });

  const actualRole = resolveUserRole(user, isAdmin, planId, isTrialActive);
  const effectiveRole = simulatedRole || actualRole;
  const roleConfig = ROLE_CONFIGS[effectiveRole] || ROLE_CONFIGS.anonymous;
  const isSimulating = Boolean(simulatedRole);

  const setSimulatedRole = (role: UserRole | null) => {
    setSimulatedRoleState(role);
    try {
      if (role) {
        localStorage.setItem(ROLE_SIMULATION_KEY, role);
      } else {
        localStorage.removeItem(ROLE_SIMULATION_KEY);
      }
    } catch (err) {
      logger.warn('Failed to store simulated role in storage:', err);
    }
  };

  const resetSimulation = () => {
    setSimulatedRole(null);
  };

  const hasPermission = (permission: AppPermission): boolean => {
    const trialLocked = isTrialActive && !isSimulating;
    return checkPermission(effectiveRole, permission, trialLocked);
  };

  const canAccessRoute = (pathname: string) => {
    const trialLocked = isTrialActive && !isSimulating;
    return checkRouteAccess(pathname, effectiveRole, trialLocked);
  };

  return (
    <RoleSecurityContext.Provider value={{
      actualRole,
      simulatedRole,
      effectiveRole,
      roleConfig,
      isSimulating,
      setSimulatedRole,
      resetSimulation,
      hasPermission,
      canAccessRoute
    }}>
      {children}
    </RoleSecurityContext.Provider>
  );
};

export const useRoleSecurity = () => useContext(RoleSecurityContext);
