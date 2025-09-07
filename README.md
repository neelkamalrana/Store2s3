# Store2S3 📸☁️

A modern web application for storing and managing photos using AWS S3, built with React, Node.js, and Express.

## ✨ Features

- **📸 Photo Upload**: Drag & drop or click to upload photos
- **☁️ S3 Storage**: Secure cloud storage with AWS S3
- **🔐 User Authentication**: Secure authentication with AWS Cognito
- **👤 User-Specific Photos**: Each user only sees their own photos
- **📱 Responsive Design**: Works on all devices
- **🚀 AWS Native**: Everything runs within AWS ecosystem
- **💰 Cost-Effective**: Minimal AWS costs

## 🏗️ Architecture

```
Frontend (React) → Backend (Node.js/Express) → AWS S3
                                    ↓
                              AWS Cognito (Authentication)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- AWS Account with S3 bucket and Cognito User Pool
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/store2s3.git
cd store2s3
```

### 2. Install Dependencies

```bash
npm run install-all
```

### 3. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your AWS credentials
nano .env
```

**Required Environment Variables:**
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name

# AWS Cognito Configuration
AWS_COGNITO_USER_POOL_ID=your_user_pool_id
AWS_COGNITO_CLIENT_ID=your_app_client_id
AWS_COGNITO_REGION=us-east-1
```

### 4. Start Development Servers

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## 🌐 Deployment

### Option 1: AWS EC2 (Recommended)

The application is currently deployed on AWS EC2 with:
- **HTTPS**: Secure SSL certificate via Let's Encrypt
- **Domain**: `3.16.108.174.nip.io` (free nip.io domain)
- **SSL**: Trusted certificate with auto-renewal
- **Security**: HSTS, security headers, and encryption

**Live Application**: https://3.16.108.174.nip.io

### Option 2: Other Platforms

- **Vercel**: `vercel`
- **Netlify**: Upload `client/build` folder
- **Heroku**: `heroku create && git push heroku main`

## 🚀 Current Deployment Status

### ✅ Production Ready
- **Live URL**: https://3.16.108.174.nip.io
- **SSL Certificate**: Let's Encrypt (auto-renewing)
- **Domain**: Free nip.io domain
- **Security**: HTTPS with HSTS and security headers
- **Hosting**: AWS EC2 with Nginx reverse proxy
- **Process Management**: PM2 for Node.js applications

### 🔒 Security Features

- ✅ `.env` files (AWS credentials)
- ✅ `*.pem` files (EC2 key pairs)
- ✅ `node_modules/` (dependencies)
- ✅ `client/build/` (production builds)
- ✅ AWS configuration files
- ✅ Database credentials
- ✅ JWT secrets

### Security Best Practices

1. **Never commit `.env` files**
2. **Use IAM roles when possible**
3. **Rotate AWS keys regularly**
4. **Enable S3 bucket encryption**
5. **Use HTTPS in production**

## 📁 Project Structure

```
store2s3/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication
│   └── index.js           # Main server
├── .gitignore             # Git ignore rules
├── env.example            # Environment template
├── package.json           # Project dependencies
└── README.md              # This file
```

## 🔧 Configuration Modes

### S3-Only Mode (Default)
- No database required
- Photos stored directly in S3
- No user authentication
- Minimal setup and costs

### Full Authentication Mode
- MongoDB database
- User registration/login
- User-specific photos
- JWT authentication

## 📊 AWS Services Used

- **S3**: Photo storage
- **EC2**: Application hosting
- **IAM**: User permissions
- **Security Groups**: Network security

## 💰 Cost Estimation

- **EC2 t3.micro**: ~$10-15/month
- **S3 Storage**: ~$0.023/GB/month
- **Data Transfer**: ~$0.09/GB
- **Total**: ~$15-25/month

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start both servers
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm run install-all  # Install all dependencies
```

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload` - Upload single photo
- `POST /api/upload-multiple` - Upload multiple photos
- `GET /api/photos` - Get user's photos
- `DELETE /api/photos/:id` - Delete photo

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change PORT in .env
2. **AWS credentials error**: Check .env file
3. **S3 access denied**: Update bucket permissions
4. **MongoDB connection**: Check MONGODB_URI

### Logs

```bash
# Backend logs
npm run server

# Frontend logs
npm run client

# Production logs (EC2)
sudo journalctl -u store2s3 -f
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: This README
- **AWS Help**: AWS Documentation

## 🔄 Updates

- **Dependencies**: `npm update`
- **AWS CLI**: `aws --version`
- **Node.js**: Check nodejs.org

---

**Built with ❤️ using React, Node.js, and AWS**
