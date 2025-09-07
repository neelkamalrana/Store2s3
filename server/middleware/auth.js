const { CognitoIdentityProviderClient, GetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_COGNITO_REGION || process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Middleware to verify Cognito JWT token
const authenticateCognitoToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token with Cognito
    const command = new GetUserCommand({
      AccessToken: token
    });

    const response = await cognitoClient.send(command);
    
    // Extract user info from Cognito response
    req.user = {
      username: response.Username,
      email: response.UserAttributes.find(attr => attr.Name === 'email')?.Value,
      sub: response.UserAttributes.find(attr => attr.Name === 'sub')?.Value,
      cognitoUser: true
    };

    next();
  } catch (error) {
    console.error('Cognito auth error:', error);
    if (error.name === 'NotAuthorizedException') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};


// Middleware to check if user owns the resource
const checkOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.key;
      const resource = await resourceModel.findOne({ 
        _id: resourceId, 
        user: req.user._id 
      });

      if (!resource) {
        return res.status(403).json({ error: 'Access denied: Resource not found or not owned by user' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ error: 'Ownership verification failed' });
    }
  };
};

// Middleware to check if user is admin (optional)
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

module.exports = {
  authenticateCognitoToken,
  checkOwnership,
  requireAdmin
};
