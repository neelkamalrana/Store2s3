import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { fetchAuthSession } from 'aws-amplify/auth';
import './AuthForms.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { checkAuthState } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing authentication callback...');
        console.log('📍 Current URL:', window.location.href);
        
        // Small delay to ensure Cognito state is properly set
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For implicit flow, tokens should be in URL hash
        const hash = window.location.hash;
        console.log('🔍 URL hash:', hash);
        
        // Try to fetch the session to get tokens
        try {
          const session = await fetchAuthSession();
          console.log('✅ Session obtained:', session.tokens ? 'Tokens available' : 'No tokens');
          if (session.tokens?.accessToken) {
            console.log('✅ Access token available:', session.tokens.accessToken.toString().substring(0, 50) + '...');
          }
        } catch (sessionError) {
          console.log('⚠️ Session fetch failed:', sessionError.message);
        }
        
        // Check if user is authenticated after callback
        await checkAuthState();
        
        // Redirect to homepage after successful authentication
        navigate('/home');
      } catch (error) {
        console.error('Callback error:', error);
        // Redirect to login page if authentication failed
        navigate('/');
      }
    };

    handleCallback();
  }, [checkAuthState, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="loading-spinner"></div>
        <p>Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
