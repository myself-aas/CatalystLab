import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { TopNav, NavLink } from './TopNav';
import { SearchButton } from './SearchButton';
import { Sidebar } from './Sidebar';
import { NavGroup } from '../../../types/design-system';
import { Menu, X, Moon, Sun, Monitor } from 'lucide-react';

const GithubIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-8.5a6.5 6.5 0 0 0-1.7-4.5 5.8 5.8 0 0 0-.2-4.4s-1.4-.5-4.5 2.6a15.8 15.8 0 0 0-8 0C3.4 2 2 2.5 2 2.5a5.8 5.8 0 0 0-.2 4.4 6.5 6.5 0 0 0-1.7 4.5c0 7 3 8.2 6 8.5a4.8 4.8 0 0 0-1 3.2v4"></path>
    <path d="M9 18c-4.5 1.6-5-2.5-5-2.5"></path>
  </svg>
);

interface ReactDevLayoutProps {
  children: React.ReactNode;
  sidebarGroups: NavGroup[];
  activePath?: string;
  brandName?: string;
  brandIcon?: React.ReactNode;
  githubUrl?: string;
}

export const ReactDevLayout: React.FC<ReactDevLayoutProps> = ({
  children,
  sidebarGroups,
  activePath,
  brandName = 'React',
  brandIcon,
  githubUrl
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system'); // Local mock for demo if no context

  return (
    <div className="min-h-screen bg-[#1F2223] font-sans antialiased selection:bg-[rgba(240,250,255,0.10)] selection:text-[#F0FAFF] text-[#F0FAFF] pt-16">
      {/* Top Navigation Bar */}
      <TopNav>
        {/* Left: Brand & Mobile Menu */}
        <div className="flex items-center gap-4 lg:w-72">
          <button
            className="lg:hidden p-2 -ml-2 text-[rgba(240,250,255,0.65)] hover:text-[#F0FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(240,250,255,0.20)] rounded-full hover:bg-[rgba(240,250,255,0.05)]"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a href="/" className="flex items-center gap-2 text-[#F0FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(240,250,255,0.20)] rounded-full px-1 py-1">
            {brandIcon || (
              <svg width="22" height="22" viewBox="-10.5 -9.45 21 18.9" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#F0FAFF]">
                <circle cx="0" cy="0" r="2" fill="currentColor"></circle>
                <g stroke="currentColor" strokeWidth="1" fill="none">
                  <ellipse rx="10" ry="4.5"></ellipse>
                  <ellipse rx="10" ry="4.5" transform="rotate(60)"></ellipse>
                  <ellipse rx="10" ry="4.5" transform="rotate(120)"></ellipse>
                </g>
              </svg>
            )}
            <span className="font-bold text-[17px] tracking-tight">{brandName}</span>
          </a>
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center px-4 max-w-2xl">
          <SearchButton onClick={() => /* open search */ () => {}} />
        </div>

        {/* Right: Links & Actions */}
        <div className="flex items-center justify-end gap-1 lg:gap-2 lg:w-72">
          <div className="hidden lg:flex items-center">
            <NavLink href="/methodology" active={activePath?.startsWith('/methodology')}>Learn</NavLink>
            <NavLink href="/api-docs" active={activePath?.startsWith('/api-docs')}>Reference</NavLink>
            <NavLink href="/insights" active={activePath?.startsWith('/insights')}>Community</NavLink>
            <NavLink href="/blogs" active={activePath?.startsWith('/blogs')}>Blog</NavLink>
          </div>

          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[rgba(240,250,255,0.08)] hidden sm:flex">
            <button
              className="p-2 text-[rgba(240,250,255,0.55)] hover:text-[#F0FAFF] transition-colors rounded-full hover:bg-[rgba(240,250,255,0.05)]"
              title="Toggle theme"
              onClick={() => {
                const next = theme === 'light' ? 'dark' : 'light';
                setTheme(next);
                document.documentElement.classList.toggle('dark', next === 'dark');
                document.documentElement.dataset.theme = next;
              }}
            >
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank" rel="noopener noreferrer"
                className="p-2 text-[rgba(240,250,255,0.55)] hover:text-[#F0FAFF] transition-colors rounded-full hover:bg-[rgba(240,250,255,0.05)]"
              >
                <GithubIcon />
              </a>
            )}
          </div>
        </div>
      </TopNav>

      {/* Main Content Area */}
      <div className="max-w-[90rem] mx-auto w-full flex items-start flex-1">
        
        {/* Left Sidebar */}
        <Sidebar 
          groups={sidebarGroups} 
          activePath={activePath} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Page Content */}
        <main className="flex-1 min-w-0 flex justify-center py-10 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};
