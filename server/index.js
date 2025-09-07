const express = require('express');
const cors = require('cors');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import middleware
const { authenticateCognitoToken } = require('./middleware/auth');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Check if AWS credentials are configured
const isAWSConfigured = process.env.AWS_ACCESS_KEY_ID && 
                       process.env.AWS_SECRET_ACCESS_KEY && 
                       process.env.AWS_REGION && 
                       process.env.S3_BUCKET_NAME;

let s3, upload;

if (isAWSConfigured) {
  // AWS S3 Configuration
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  // Multer S3 configuration for file uploads
  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const userPrefix = req.user ? `${req.user.sub}/` : '';
        const fileName = `${userPrefix}${Date.now()}_${file.originalname}`;
        cb(null, fileName);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Check file type
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });
} else {
  console.log('⚠️  AWS S3 not configured. Photo uploads will be disabled.');
  console.log('   Please set up your .env file with AWS credentials.');
}

console.log('✅ Cognito authentication enabled');

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Upload single photo (Protected - requires Cognito authentication)
app.post('/api/upload', authenticateCognitoToken, async (req, res) => {
  if (!isAWSConfigured) {
    return res.status(503).json({ error: 'AWS S3 not configured. Please set up your environment variables.' });
  }
  
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      res.json({
        message: 'File uploaded successfully',
        file: {
          id: req.file.key,
          url: req.file.location,
          name: req.file.key,
          size: req.file.size,
          type: req.file.mimetype,
          uploadedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});

// Upload multiple photos (Protected - requires Cognito authentication)
app.post('/api/upload-multiple', authenticateCognitoToken, async (req, res) => {
  console.log('📤 Upload request received from user:', req.user.username);
  
  if (!isAWSConfigured) {
    console.log('❌ AWS S3 not configured');
    return res.status(503).json({ error: 'AWS S3 not configured. Please set up your environment variables.' });
  }

  upload.array('photos', 10)(req, res, async (err) => {
    if (err) {
      console.log('❌ Upload middleware error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    
    try {
      console.log('📁 Files received:', req.files ? req.files.length : 0);
      
      if (!req.files || req.files.length === 0) {
        console.log('❌ No files uploaded');
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const photos = req.files.map(file => ({
        id: file.key,
        url: file.location,
        name: file.key,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date()
      }));

      console.log('✅ Upload successful:', photos.length, 'files uploaded');
      res.json({
        message: `${photos.length} files uploaded successfully`,
        uploadedCount: photos.length,
        files: photos
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});

// Get user's photos (Protected - requires Cognito authentication)
app.get('/api/photos', authenticateCognitoToken, async (req, res) => {
  try {
    if (!isAWSConfigured) {
      return res.status(503).json({ error: 'AWS S3 not configured. Please set up your environment variables.' });
    }
    
    const { page = 1, limit = 20 } = req.query;
    const userPrefix = `${req.user.sub}/`;
    
    try {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: userPrefix,
        MaxKeys: parseInt(limit) * parseInt(page)
      };

      const data = await s3.send(new ListObjectsV2Command(params));
      const userPhotos = (data.Contents || [])
        .filter(item => item.Key.startsWith(userPrefix))
        .map(item => ({
          key: item.Key,
          url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
          size: item.Size,
          lastModified: item.LastModified,
          originalName: item.Key.split('/').pop().split('_').slice(1).join('_')
        }));

      res.json({ 
        photos: userPhotos,
        user: {
          username: req.user.username,
          email: req.user.email
        }
      });
    } catch (error) {
      console.error('Error fetching photos from S3:', error);
      res.status(500).json({ error: 'Failed to fetch photos' });
    }
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});


// Delete photo (Protected - requires Cognito authentication)
app.delete('/api/photos/:key', authenticateCognitoToken, async (req, res) => {
  if (!isAWSConfigured) {
    return res.status(503).json({ error: 'AWS S3 not configured. Please set up your environment variables.' });
  }
  
  try {
    const { key } = req.params;
    const userPrefix = `${req.user.sub}/`;
    
    // Verify the photo belongs to the authenticated user
    if (!key.startsWith(userPrefix)) {
      return res.status(403).json({ error: 'Access denied: Photo not owned by user' });
    }
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    await s3.send(new DeleteObjectCommand(params));
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
