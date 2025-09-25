import React, { useState } from 'react';
import Header from './components/Header';
import JobListings from './pages/JobListings';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Auth from './pages/Auth';
import { useAuth } from './hooks/useAuth';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.JobListings);
  const { user } = useAuth();

  const renderPage = () => {
    if (!user) {
      return React.createElement(Auth, null);
    }
    switch (currentPage) {
      case Page.JobListings:
        return React.createElement(JobListings, null);
      case Page.RecruiterDashboard:
        return React.createElement(RecruiterDashboard, null);
      default:
        return React.createElement(JobListings, null);
    }
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-background" },
      React.createElement(Header, { currentPage: currentPage, setCurrentPage: setCurrentPage }),
      React.createElement('main', { className: "container mx-auto p-4 md:p-8" },
        renderPage()
      )
    )
  );
};

export default App;
