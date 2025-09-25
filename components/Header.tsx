import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { BriefcaseIcon, UserGroupIcon } from '../constants';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const NavLink: React.FC<{ page: Page; children: React.ReactNode }> = ({ page, children }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          isActive ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-primary">
              {BriefcaseIcon}
              <span className="font-bold text-xl text-text">Gemini Jobs</span>
            </div>
            {user && (
              <nav className="hidden md:flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
                <NavLink page={Page.JobListings}>Job Listings</NavLink>
                {user.role === 'recruiter' && (
                  <NavLink page={Page.RecruiterDashboard}>Dashboard</NavLink>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-sm text-muted">
                  Welcome, <span className="font-medium text-text">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
                <div className="text-sm font-medium text-muted">Please sign in</div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;