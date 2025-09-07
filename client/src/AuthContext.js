import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signInWithRedirect, signOut, fetchAuthSession } from 'aws-amplify/auth';
import awsConfig from './aws-config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    if (!awsConfig.isCognitoConfigured) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Checking authentication state...');
      const currentUser = await getCurrentUser();
      console.log('👤 Current user:', currentUser.username);
      
      const session = await fetchAuthSession();
      console.log('🔑 Session tokens:', session.tokens ? 'Available' : 'Not available');
      
      setUser(currentUser);
      
      // Extract the JWT token properly
      const accessToken = session.tokens?.accessToken;
      if (accessToken) {
        const tokenString = accessToken.toString();
        setToken(tokenString);
        console.log('✅ Access token obtained:', tokenString.substring(0, 50) + '...');
      } else {
        console.log('❌ No access token found in session');
        console.log('Session details:', JSON.stringify(session, null, 2));
        setToken(null);
      }
    } catch (error) {
      console.log('❌ User not authenticated:', error.message);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!awsConfig.isCognitoConfigured) {
      return { success: false, error: 'AWS Cognito not configured. Please set up your environment variables.' };
    }

    try {
      await signInWithRedirect();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ global: true });
      setUser(null);
      setToken(null);
      // Redirect to the initial page after logout
      window.location.href = '/';
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setToken(null);
      window.location.href = '/';
      return { success: true };
    }
  };

  const value = {
    user,
    token,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
