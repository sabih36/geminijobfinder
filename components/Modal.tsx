import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    React.createElement('div', { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" },
      React.createElement('div', { className: "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" },
        React.createElement('div', { className: "flex justify-between items-center p-4 border-b" },
          React.createElement('h3', { className: "text-xl font-semibold text-text" }, title),
          React.createElement('button', { onClick: onClose, className: "text-gray-400 hover:text-gray-600" },
            React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
              React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
            )
          )
        ),
        React.createElement('div', { className: "p-6 overflow-y-auto" },
          children
        )
      )
    )
  );
};

export default Modal;
