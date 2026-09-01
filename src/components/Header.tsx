import React from 'react';

interface HeaderProps {
  currentTab: 'prep' | 'interview' | 'report';
  onSelectTab: (tab: 'prep' | 'interview' | 'report') => void;
  hasResume: boolean;
  hasCompletedInterview: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  hasResume,
  hasCompletedInterview
}) => {
  return (
    <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onSelectTab('prep')}
          className="text-left group focus:outline-none"
        >
          <span className="font-serif-headline text-3xl tracking-tight text-stone-900">
            <span className="italic font-bold">prep</span>
            <span className="font-bold">IQ</span>
          </span>
        </button>

        {/* Navigation items */}
        <nav className="flex items-center space-x-10 text-xs font-semibold tracking-wider">
          <button
            onClick={() => onSelectTab('prep')}
            className={`relative py-2 transition-colors duration-150 uppercase ${
              currentTab === 'prep'
                ? 'text-stone-900 font-bold'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Prep Room
            {currentTab === 'prep' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900" />
            )}
          </button>

          <button
            onClick={() => {
              if (hasResume) onSelectTab('interview');
            }}
            disabled={!hasResume}
            className={`relative py-2 transition-colors duration-150 uppercase ${
              currentTab === 'interview'
                ? 'text-stone-900 font-bold'
                : hasResume
                ? 'text-stone-400 hover:text-stone-700'
                : 'text-stone-300 cursor-not-allowed'
            }`}
            title={!hasResume ? 'Upload a resume to begin interview' : 'Active Session'}
          >
            Active Session
            {currentTab === 'interview' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900" />
            )}
          </button>

          <button
            onClick={() => {
              if (hasCompletedInterview) onSelectTab('report');
            }}
            disabled={!hasCompletedInterview}
            className={`relative py-2 transition-colors duration-150 uppercase ${
              currentTab === 'report'
                ? 'text-stone-900 font-bold'
                : hasCompletedInterview
                ? 'text-stone-400 hover:text-stone-700'
                : 'text-stone-300 cursor-not-allowed'
            }`}
            title={!hasCompletedInterview ? 'Complete an interview to view report' : 'Report Ledger'}
          >
            Report Ledger
            {currentTab === 'report' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
