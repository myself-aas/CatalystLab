import React from 'react';
import { CommandCenterHUD } from '../components/dashboard/CommandCenterHUD';
import { SEOHead } from '../components/common/SEOHead';

export const CommandCenterPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Command Center HUD • CatalystLab Telemetry Platform"
        description="Real-time 3-column telemetry command center with focus mode enzyme filtering, continuous synthetic cron streams, and global edge probe diagnostics."
        canonicalPath="/app"
      />
      <CommandCenterHUD />
    </>
  );
};

export default CommandCenterPage;
