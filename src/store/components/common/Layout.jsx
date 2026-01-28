import React, { memo, useState } from 'react';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';

const Layout = memo(({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const toggleSidebar = () => setIsSidebarMinimized(!isSidebarMinimized);

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block h-screen overflow-hidden flex-shrink-0">
        <Sidebar isMinimized={isSidebarMinimized} onToggle={toggleSidebar} />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Mobile */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="p-4 h-full flex flex-col overflow-hidden">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="mb-4 text-gray-600 hover:text-gray-900 flex-shrink-0 self-end"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Sidebar onToggle={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>

        {/* Main Scrollable Content */}
        <main id="main-scroll-container" className="flex-1 min-w-0 overflow-y-auto relative flex flex-col h-full">
          {/* Mobile Menu Button - Fixed at top left when scrolled */}
          <div className="lg:hidden sticky top-0 z-30 p-4 pointer-events-none">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-colors pointer-events-auto"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          {children}
        </main>
      </div>

      {/* Chatbot "Ed" */}
      <Chatbot />
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;