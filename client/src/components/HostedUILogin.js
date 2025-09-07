import React from 'react';
import { useAuth } from '../AuthContext';
import { signInWithRedirect } from 'aws-amplify/auth';
import './AuthForms.css';

const HostedUILogin = () => {
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      console.log('🔍 Redirecting to Cognito Hosted UI...');
      await signInWithRedirect();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome to Store2S3</h2>
        <p>Secure photo storage with AWS Cognito authentication</p>
        
        <div className="login-section">
          <button 
            onClick={handleLogin}
            className="login-button"
          >
            🔐 Sign In with AWS Cognito
          </button>
          
          <div className="features">
            <h3>Features:</h3>
            <ul>
              <li>✅ Secure authentication</li>
              <li>✅ Professional login page</li>
              <li>✅ Password reset</li>
              <li>✅ Email verification</li>
              <li>✅ Multi-factor authentication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostedUILogin;
