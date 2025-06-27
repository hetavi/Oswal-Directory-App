import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { FamilyProvider } from './context/FamilyContext.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
     <FamilyProvider>
    <App />
    </FamilyProvider>
  </AuthProvider>
);
