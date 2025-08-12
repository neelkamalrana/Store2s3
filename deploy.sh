#!/bin/bash

# Store2S3 Deployment Script
echo "🚀 Starting Store2S3 deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your AWS credentials first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build React app
echo "🔨 Building React app..."
npm run build

# Check if build was successful
if [ ! -d "client/build" ]; then
    echo "❌ Error: Build failed! client/build directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Start production server
echo "🌐 Starting production server..."
npm start
