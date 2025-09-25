import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { BriefcaseIcon } from './Icons';
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
      React.createElement('button', {
        onClick: () => setCurrentPage(page),
        className: `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          isActive ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
        }`
      }, children)
    );
  };

  return (
    React.createElement('header', { className: "bg-card shadow-sm" },
      React.createElement('div', { className: "container mx-auto px-4 md:px-8" },
        React.createElement('div', { className: "flex justify-between items-center h-16" },
          React.createElement('div', { className: "flex items-center space-x-4" },
            React.createElement('div', { className: "flex items-center space-x-2 text-primary" },
              BriefcaseIcon,
              React.createElement('span', { className: "font-bold text-xl text-text" }, "Gemini Jobs")
            ),
            user && (
              React.createElement('nav', { className: "hidden md:flex items-center space-x-2 bg-gray-50 p-1 rounded-lg" },
                // Fix: Moved children into props object to satisfy NavLink's required children prop type.
                React.createElement(NavLink, { page: Page.JobListings, children: "Job Listings" }),
                user.role === 'recruiter' && (
                  // Fix: Moved children into props object to satisfy NavLink's required children prop type.
                  React.createElement(NavLink, { page: Page.RecruiterDashboard, children: "Dashboard" })
                )
              )
            )
          ),
          React.createElement('div', { className: "flex items-center space-x-4" },
            user ? (
              React.createElement(React.Fragment, null,
                React.createElement('div', { className: "text-sm text-muted" },
                  "Welcome, ", React.createElement('span', { className: "font-medium text-text" }, user.name)
                ),
                React.createElement('button', {
                  onClick: logout,
                  className: "px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                }, "Log Out")
              )
            ) : (
                React.createElement('div', { className: "text-sm font-medium text-muted" }, "Please sign in")
            )
          )
        )
      )
    )
  );
};

export default Header;