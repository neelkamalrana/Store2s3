import { Amplify } from 'aws-amplify';

// Check if Cognito is configured
const isCognitoConfigured = process.env.REACT_APP_COGNITO_USER_POOL_ID && 
                           process.env.REACT_APP_COGNITO_CLIENT_ID &&
                           process.env.REACT_APP_COGNITO_USER_POOL_ID !== 'your_user_pool_id_here' &&
                           process.env.REACT_APP_COGNITO_CLIENT_ID !== 'your_app_client_id_here';

if (isCognitoConfigured) {
  const awsConfig = {
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
        },
        // Always include client secret if it exists
        ...(process.env.REACT_APP_COGNITO_CLIENT_SECRET && {
          userPoolClientSecret: process.env.REACT_APP_COGNITO_CLIENT_SECRET
        })
      }
    }
  };

  Amplify.configure(awsConfig);
  console.log('✅ AWS Cognito configured successfully');
  if (process.env.REACT_APP_COGNITO_CLIENT_SECRET) {
    console.log('✅ Client secret configured');
  }
} else {
  console.warn('⚠️ AWS Cognito not configured. Please set up your .env file with Cognito credentials.');
}

const awsConfig = { isCognitoConfigured };
export default awsConfig;
