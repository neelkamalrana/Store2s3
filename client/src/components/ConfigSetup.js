import React from 'react';
import './AuthForms.css';

const ConfigSetup = () => {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>🔧 AWS Cognito Configuration Required</h2>
        <div className="config-instructions">
          <p>To use this application, you need to configure AWS Cognito authentication.</p>
          
          <h3>📋 Steps to Configure:</h3>
          <ol>
            <li><strong>Create AWS Cognito User Pool:</strong>
              <ul>
                <li>Go to AWS Console → Cognito service</li>
                <li>Click "Create user pool"</li>
                <li>Choose "Email" as sign-in option</li>
                <li>Set password policy (default is fine)</li>
                <li>Enable email recovery</li>
              </ul>
            </li>
            
            <li><strong>Configure App Integration:</strong>
              <ul>
                <li>App client name: <code>store2s3-web-client</code></li>
                <li>Client secret: <strong>Uncheck</strong> (recommended for web apps) OR <strong>Check</strong> (if you need it)</li>
                <li>Authentication flows: Enable "ALLOW_USER_SRP_AUTH"</li>
                <li><strong>Note:</strong> If you enable client secret, you'll need to add it to your .env file</li>
              </ul>
            </li>
            
            <li><strong>Get Your Credentials:</strong>
              <ul>
                <li>Copy the <strong>User Pool ID</strong> (looks like: <code>us-east-1_XXXXXXXXX</code>)</li>
                <li>Copy the <strong>App Client ID</strong> (long string of characters)</li>
                <li>If you enabled client secret, copy the <strong>Client Secret</strong> as well</li>
              </ul>
            </li>
            
            <li><strong>Update Environment Files:</strong>
              <ul>
                <li>Edit <code>client/.env</code> with your Cognito credentials</li>
                <li>Edit root <code>.env</code> with your AWS and Cognito credentials</li>
              </ul>
            </li>
          </ol>
          
          <div className="env-example">
            <h4>📁 client/.env file should contain:</h4>
            <pre>{`REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=your_user_pool_id_here
REACT_APP_COGNITO_CLIENT_ID=your_app_client_id_here
# Only add this if your app client has a secret:
REACT_APP_COGNITO_CLIENT_SECRET=your_client_secret_here`}</pre>
          </div>
          
          <div className="env-example">
            <h4>📁 Root .env file should contain:</h4>
            <pre>{`# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_s3_bucket_name_here

# AWS Cognito Configuration
AWS_COGNITO_USER_POOL_ID=your_user_pool_id_here
AWS_COGNITO_CLIENT_ID=your_app_client_id_here
AWS_COGNITO_REGION=us-east-1`}</pre>
          </div>
          
          <p className="restart-note">
            <strong>🔄 After updating the .env files, restart the application:</strong><br/>
            <code>npm run dev</code>
          </p>
          
          <div className="troubleshooting">
            <h3>🔧 Troubleshooting</h3>
            <div className="troubleshoot-item">
              <h4>❌ "Client is configured with secret but SECRET_HASH was not received"</h4>
              <p><strong>Solution:</strong> Your app client has a client secret enabled. You have two options:</p>
              <ul>
                <li><strong>Option 1 (Recommended):</strong> Go to AWS Console → Cognito → Your User Pool → App integration → App clients → Edit your app client → Uncheck "Generate client secret" → Save</li>
                <li><strong>Option 2:</strong> Add the client secret to your <code>client/.env</code> file as <code>REACT_APP_COGNITO_CLIENT_SECRET=your_secret_here</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigSetup;
