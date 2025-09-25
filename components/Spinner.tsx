import React from 'react';

const Spinner: React.FC = () => {
  return (
    React.createElement('div', { className: "flex justify-center items-center py-10" },
      React.createElement('div', { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary" })
    )
  );
};

export default Spinner;
