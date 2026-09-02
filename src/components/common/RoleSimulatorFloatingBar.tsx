import React, { useState } from 'react';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { UserRole, ROLE_CONFIGS } from '../../utils/rolePermissions';
import { 
  Shield, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  User, 
  Sparkles, 
  Zap, 
  Users, 
  Building2, 
  Crown,
  Eye,
  Check
} from 'lucide-react';

export const RoleSimulatorFloatingBar: React.FC = () => {
  const { effectiveRole, actualRole, isSimulating, setSimulatedRole, resetSimulation } = useRoleSecurity();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; icon: React.ComponentType<{ className?: string }>; label: string; badge: string }[] = [
    { role: 'anonymous', icon: User, label: 'Guest Visitor', badge: 'Public' },
    { role: 'user', icon: Sparkles, label: 'Free Developer', badge: '50 units' },
    { role: 'pro', icon: Zap, label: 'Pro Subscriber', badge: '500 units' },
    { role: 'team', icon: Users, label: 'Team / Agency', badge: '1,500 units' },
    { role: 'enterprise', icon: Building2, label: 'Enterprise', badge: '5,000 units' },
    { role: 'superadmin', icon: Crown, label: 'Superadmin', badge: 'Bypass' }
  ];

  const currentConfig = ROLE_CONFIGS[effectiveRole];

  return (
    <aside 
      aria-label="Role and Security Preview Panel" 
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end"
    >
      {/* Expanded Role Selection Popover */}
      {isOpen && (
        <div className="mb-2 w-80 rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-xl text-foreground animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Frontend Security &amp; RBAC Simulator
              </span>
            </div>
            {isSimulating && (
              <button
                onClick={resetSimulation}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Reset to real authenticated role"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
            Preview how routes, navigation bars, pricing states, blog studios, and telemetry features dynamically adapt per role.
          </p>

          <div className="space-y-1.5">
            {roles.map((item) => {
              const Icon = item.icon;
              const isSelected = effectiveRole === item.role;
              const isReal = actualRole === item.role;

              return (
                <button
                  key={item.role}
                  onClick={() => {
                    setSimulatedRole(item.role);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border border-cyan-400/50 text-primary-foreground shadow-sm'
                      : 'hover:bg-muted text-muted-foreground border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-muted-foreground'}`} />
                    <span className="truncate">{item.label}</span>
                    {isReal && (
                      <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                        (Auth)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {item.badge}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>Effective: <strong className="text-primary-foreground">{currentConfig.displayName}</strong></span>
            <span>Compute: <strong className="text-cyan-300">{currentConfig.dailyComputeUnits > 90000 ? '∞' : currentConfig.dailyComputeUnits}</strong></span>
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md ${
          isSimulating
            ? 'border-amber-400/60 bg-amber-950/80 text-amber-200 hover:bg-amber-900/90'
            : 'border-border bg-background/90 text-foreground hover:bg-muted'
        }`}
        title="Toggle RBAC & Role Preview Simulator"
      >
        <div className="flex items-center gap-1.5">
          <Eye className={`h-3.5 w-3.5 ${isSimulating ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
          <span className="hidden sm:inline">Role Preview:</span>
          <span className={`rounded px-1.5 py-0.5 text-[11px] font-mono ${isSimulating ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
            {currentConfig.shortLabel}
          </span>
        </div>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
    </aside>
  );
};

export default RoleSimulatorFloatingBar;
