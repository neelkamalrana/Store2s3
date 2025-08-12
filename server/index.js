const express = require('express');
const cors = require('cors');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const Photo = require('./models/Photo');
const { authenticateToken } = require('./middleware/auth');

// Connect to MongoDB (optional for development)
if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/store2s3') {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
} else {
  console.log('⚠️ MongoDB not configured - running in S3-only mode');
}

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
        const fileName = `${Date.now()}_${file.originalname}`;
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

// Routes (only if MongoDB is available)
if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/store2s3') {
  app.use('/api/auth', authRoutes);
  console.log('✅ Authentication routes enabled');
} else {
  console.log('⚠️ Authentication routes disabled - MongoDB not configured');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Upload single photo (Protected - requires authentication if MongoDB available)
app.post('/api/upload', async (req, res) => {
  if (!isAWSConfigured) {
    return res.status(503).json({ error: 'AWS S3 not configured. Please set up your environment variables.' });
  }

  // Check authentication if MongoDB is available
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/store2s3') {
    try {
      await authenticateToken(req, res, () => {});
    } catch (error) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }
  
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Save photo metadata to database if MongoDB is available
      let photoId = null;
      if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/store2s3') {
        const photo = new Photo({
          user: req.user._id,
          key: req.file.key,
          originalName: req.file.originalname,
          url: req.file.location,
          size: req.file.size,
          mimeType: req.file.mimetype
        });

        await photo.save();
        photoId = photo._id;
      }

      res.json({
        message: 'File uploaded successfully',
        file: {
          id: photoId || req.file.key,
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

// Upload multiple photos (Protected - requires authentication if MongoDB available)
app.post('/api/upload-multiple', async (req, res) => {
  if (!isAWSConfigured) {
    return res.status(503).json({ error: 'AWS S3 not configured. Please set up your environment variables.' });
  }
  
  // Check authentication if MongoDB is available
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/store2s3') {
    try {
      await authenticateToken(req, res, () => {});
    } catch (error) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  upload.array('photos', 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Save all photos to database if MongoDB is available
      const photos = [];
      for (const file of req.files) {
        let photoId = null;
        if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/store2s3') {
          const photo = new Photo({
            user: req.user._id,
            key: file.key,
            originalName: file.originalname,
            url: file.location,
            size: file.size,
            mimeType: file.mimetype
          });
          await photo.save();
          photoId = photo._id;
        }
        
        photos.push({
          id: photoId || file.key,
          url: file.location,
          name: file.key,
          size: file.size,
          type: file.mimetype,
          uploadedAt: new Date()
        });
      }

      res.json({
        message: `${photos.length} files uploaded successfully`,
        files: photos
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});

// Get user's photos (Protected - requires authentication if MongoDB available)
app.get('/api/photos', async (req, res) => {
  try {
    // Check authentication if MongoDB is available
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/store2s3') {
      try {
        await authenticateToken(req, res, () => {});
      } catch (error) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const photos = await Photo.findByUser(req.user._id, parseInt(limit), skip);
      const total = await Photo.countDocuments({ user: req.user._id });

          res.json({
        photos: photos.map(photo => ({
          id: photo._id,
          key: photo.key,
          url: photo.url,
          originalName: photo.originalName,
          size: photo.size,
          mimeType: photo.mimeType,
          description: photo.description,
          tags: photo.tags,
          isPublic: photo.isPublic,
          views: photo.views,
          uploadedAt: photo.uploadedAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPhotos: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    } else {
      // Fallback to S3-only mode
      if (!isAWSConfigured) {
        return res.status(503).json({ error: 'AWS S3 not configured. Please set up your environment variables.' });
      }
      
      try {
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          MaxKeys: 100
        };

        const data = await s3.send(new ListObjectsV2Command(params));
        const photos = (data.Contents || []).map(item => ({
          key: item.Key,
          url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
          size: item.Size,
          lastModified: item.LastModified
        }));

        res.json({ photos });
      } catch (error) {
        console.error('Error fetching photos from S3:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
      }
    }
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Get public photos (no authentication required)
app.get('/api/photos/public', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const photos = await Photo.findPublic(parseInt(limit), skip);
    const total = await Photo.countDocuments({ isPublic: true });

    res.json({
      photos: photos.map(photo => ({
        id: photo._id,
        key: photo.key,
        url: photo.url,
        originalName: photo.originalName,
        size: photo.size,
        description: photo.description,
        tags: photo.tags,
        views: photo.views,
        uploadedAt: photo.uploadedAt,
        user: photo.user
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPhotos: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching public photos:', error);
    res.status(500).json({ error: 'Failed to fetch public photos' });
  }
});

// Delete photo (Protected - requires authentication if MongoDB available)
app.delete('/api/photos/:id', async (req, res) => {
  if (!isAWSConfigured) {
    return res.status(503).json({ error: 'AWS S3 not configured. Please set up your environment variables.' });
  }
  
  try {
    const { id } = req.params;
    
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/store2s3') {
      // Check authentication
      try {
        await authenticateToken(req, res, () => {});
      } catch (error) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Find photo and verify ownership
      const photo = await Photo.findOne({ _id: id, user: req.user._id });
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found or access denied' });
      }

      // Delete from S3
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: photo.key
      };

      await s3.send(new DeleteObjectCommand(params));
      
      // Delete from database
      await Photo.findByIdAndDelete(id);
      
      res.json({ message: 'Photo deleted successfully' });
    } else {
      // S3-only mode - delete by key
      const key = id; // In S3-only mode, id is the key
      
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
      };

      await s3.send(new DeleteObjectCommand(params));
      
      res.json({ message: 'Photo deleted successfully' });
    }
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
