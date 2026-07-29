import React, { createContext, useState, useContext } from 'react';
import './AlertModal.css';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showAlert = (msg) => {
    setMessage(msg);
    setIsOpen(true);
  };

  const closeAlert = () => {
    setIsOpen(false);
    setTimeout(() => setMessage(''), 300); // Clear message after animation
  };

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      {isOpen && (
        <div className="alert-modal-overlay" onClick={closeAlert}>
          <div 
            className="alert-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="alert-modal-header">
              <h3>Aviso</h3>
              <button className="alert-modal-close" onClick={closeAlert}>&times;</button>
            </div>
            <div className="alert-modal-body">
              <p>{message}</p>
            </div>
            <div className="alert-modal-footer">
              <button className="alert-modal-btn" onClick={closeAlert}>OK</button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
