import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import HostedUILogin from './components/HostedUILogin';
import AuthCallback from './components/AuthCallback';
import HomePage from './components/HomePage';
import ConfigSetup from './components/ConfigSetup';
import './App.css';
import awsConfig from './aws-config';

const PhotoApp = () => {
  return <HomePage />;
};

const AuthApp = () => {
  const { user, loading } = useAuth();

  // Show configuration setup if Cognito is not configured
  if (!awsConfig.isCognitoConfigured) {
    return <ConfigSetup />;
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <HostedUILogin />;
  }

  return <PhotoApp />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/*" element={<AuthApp />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
