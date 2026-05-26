'use client';

import React from 'react';

interface ResponsiveShellProps {
  children: {
    filterArea: React.ReactNode;
    mainContent: React.ReactNode;
  };
}

export const ResponsiveShell = ({ children }: ResponsiveShellProps) => (
  <div className="flex flex-col h-screen w-full bg-[#FAFDF6]">
    {/* Header / Filter Area - Fixed or Sticky at top */}
    <div className="flex-none p-4 z-10 bg-[#FAFDF6] border-b border-[#68BA7F]/20 shadow-sm">
      <div className="max-w-4xl mx-auto w-full">
        {children.filterArea}
      </div>
    </div>

    {/* Scrollable Content Area - THIS FIXES THE MOBILE SCROLL */}
    <div className="flex-1 overflow-y-auto w-full px-4 pb-24 mx-auto subtle-scrollbar">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-6">
        {children.mainContent}
      </div>
    </div>
  </div>
);
