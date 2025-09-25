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
      return <Auth />;
    }
    switch (currentPage) {
      case Page.JobListings:
        return <JobListings />;
      case Page.RecruiterDashboard:
        return <RecruiterDashboard />;
      default:
        return <JobListings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="container mx-auto p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
