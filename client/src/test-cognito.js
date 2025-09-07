// Test file to verify Cognito configuration
import { Amplify } from 'aws-amplify';

const testCognitoConfig = () => {
  console.log('🔍 Testing Cognito Configuration...');
  
  const config = {
    Auth: {
      Cognito: {
        region: process.env.REACT_APP_AWS_REGION || 'us-east-2',
        userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
        loginWith: {
          oauth: {
            domain: process.env.REACT_APP_COGNITO_DOMAIN,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: ['http://localhost:3000/auth/callback'],
            redirectSignOut: ['http://localhost:3000'],
            responseType: 'token'
          }
        }
      }
    }
  };
  
  console.log('📋 Configuration:', JSON.stringify(config, null, 2));
  
  try {
    Amplify.configure(config);
    console.log('✅ Amplify configured successfully');
  } catch (error) {
    console.error('❌ Amplify configuration failed:', error);
  }
};

export default testCognitoConfig;
