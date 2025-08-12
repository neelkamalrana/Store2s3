# 🚀 Deployment Guide

This guide covers deploying Store2S3 to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Code is working locally
- [ ] `.env` file is configured
- [ ] `.gitignore` is properly set up
- [ ] Dependencies are installed
- [ ] Tests are passing

## 🌐 Deployment Options

### 1. 🐳 AWS EC2 (Recommended)

**Pros:**
- Full control over the environment
- Everything stays within AWS
- Cost-effective for production
- Easy scaling

**Steps:**
```bash
# 1. Run deployment script
./deploy-aws.sh

# 2. SSH into instance
ssh -i store2s3-key.pem ec2-user@YOUR_EC2_IP

# 3. Clone your repository
git clone https://github.com/yourusername/store2s3.git /opt/store2s3

# 4. Install dependencies
cd /opt/store2s3
npm install
cd client && npm install && npm run build && cd ..

# 5. Start application
pm2 start ecosystem.config.js
```

**Cost:** ~$15-25/month

### 2. ☁️ Vercel (Easiest)

**Pros:**
- Zero configuration
- Automatic deployments
- Free tier available
- Great performance

**Steps:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Follow prompts
# - Link to existing project or create new
# - Set build command: cd client && npm run build
# - Set output directory: client/build
```

**Cost:** Free tier + usage-based pricing

### 3. 🌊 Netlify

**Pros:**
- Easy deployment
- Good free tier
- Automatic builds
- Form handling

**Steps:**
```bash
# 1. Build your app
cd client && npm run build

# 2. Upload build folder to Netlify
# - Drag & drop client/build folder
# - Or use Netlify CLI
```

**Cost:** Free tier + premium plans

### 4. 🦸 Heroku

**Pros:**
- Good free tier
- Easy scaling
- Add-ons available
- Good documentation

**Steps:**
```bash
# 1. Install Heroku CLI
# 2. Create app
heroku create your-app-name

# 3. Set environment variables
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set AWS_REGION=us-east-2
heroku config:set S3_BUCKET_NAME=your_bucket

# 4. Deploy
git push heroku main
```

**Cost:** Free tier + dyno pricing

## 🔒 Environment Variables

### Required Variables
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-2
S3_BUCKET_NAME=your_bucket_name
PORT=5001
NODE_ENV=production
```

### Optional Variables (for authentication)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/store2s3
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

## 🚨 Security Considerations

### Before Deployment
- [ ] Remove hardcoded credentials
- [ ] Check `.gitignore` includes `.env`
- [ ] Verify S3 bucket permissions
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS

### Production Checklist
- [ ] Use environment variables
- [ ] Enable S3 bucket encryption
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set up logging

## 📊 Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Optimize images
- Enable caching

### Backend
- Use PM2 for process management
- Enable compression middleware
- Set up proper logging
- Monitor memory usage

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# Check if app is running
curl https://your-domain.com/api/health

# Check logs
npm run server  # Development
pm2 logs        # Production
```

### Common Issues
1. **Port conflicts**: Change PORT in environment
2. **CORS errors**: Update S3 bucket CORS
3. **Upload failures**: Check AWS permissions
4. **Memory issues**: Monitor with PM2

## 💰 Cost Optimization

### AWS EC2
- Use t3.micro for development
- Consider reserved instances for production
- Monitor data transfer costs
- Use S3 lifecycle policies

### Other Platforms
- Start with free tiers
- Monitor usage limits
- Scale based on actual needs
- Use CDN for global performance

## 🔄 Continuous Deployment

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod
```

### Automatic Deployments
- Vercel: Automatic on push
- Netlify: Automatic on push
- Heroku: Automatic on push
- AWS: Manual or with CodePipeline

## 📱 Mobile Deployment

### PWA Setup
- Add service worker
- Configure manifest.json
- Enable offline functionality
- Test on mobile devices

### App Stores
- Consider React Native for mobile apps
- Use Capacitor for hybrid apps
- Test thoroughly on devices

## 🌍 Global Deployment

### Multi-Region
- Use CloudFront for CDN
- Deploy to multiple regions
- Consider edge computing
- Monitor latency

### Internationalization
- Add language support
- Consider time zones
- Localize content
- Test in target regions

---

**Choose the deployment option that best fits your needs and budget! 🚀**
