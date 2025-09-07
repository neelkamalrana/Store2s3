import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../AuthContext';
import './HomePage.css';

const HomePage = () => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, token, signOut } = useAuth();

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching photos with token:', token ? token.substring(0, 50) + '...' : 'No token');
      
      if (!token) {
        setStatusMessage('No authentication token available');
        return;
      }
      
      const response = await axios.get('/api/photos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setStatusMessage('Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch photos when token is available
  useEffect(() => {
    if (token && user) {
      fetchPhotos();
    }
  }, [token, user, fetchPhotos]);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    console.log('📁 Files dropped:', acceptedFiles.length, 'files');
    console.log('🔑 Token available:', token ? 'Yes' : 'No');
    
    if (!token) {
      setStatusMessage('No authentication token available. Please login again.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setStatusMessage('');

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        console.log('📄 Adding file:', file.name, 'Size:', file.size);
        formData.append('photos', file);
      });

      console.log('🚀 Starting upload with token:', token.substring(0, 50) + '...');

      const response = await axios.post('/api/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      console.log('✅ Upload successful:', response.data);
      setStatusMessage(`Successfully uploaded ${response.data.uploadedCount} photos!`);
      fetchPhotos(); // Refresh the photos list
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('Error response:', error.response?.data);
      setStatusMessage(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deletePhoto = async (key) => {
    try {
      await axios.delete(`/api/photos/${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStatusMessage('Photo deleted successfully!');
      fetchPhotos(); // Refresh the photos list
    } catch (error) {
      console.error('Delete error:', error);
      setStatusMessage('Failed to delete photo');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="header-content">
          <h1>📸 Store2S3 - Your Photo Gallery</h1>
          <div className="user-info">
            <span>Welcome, {user?.username || user?.email || 'User'}!</span>
            <button onClick={signOut} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="homepage-main">
        <div className="upload-section">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p>Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <div className="dropzone-content">
                <div className="upload-icon">📁</div>
                <p className="dropzone-text">
                  {isDragActive
                    ? 'Drop the photos here...'
                    : 'Drag & drop photos here, or click to select files'
                  }
                </p>
                <p className="dropzone-hint">
                  Supports: JPEG, PNG, GIF, WebP
                </p>
              </div>
            )}
          </div>

          {statusMessage && (
            <div className={`status-message ${statusMessage.includes('Success') ? 'success' : 'error'}`}>
              {statusMessage}
            </div>
          )}
        </div>

        <div className="photos-section">
          <h2>Your Photos ({photos.length})</h2>
          
          {loading ? (
            <div className="loading">Loading photos...</div>
          ) : photos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📷</div>
              <p>No photos yet. Upload some photos to get started!</p>
            </div>
          ) : (
            <div className="photos-grid">
              {photos.map((photo, index) => (
                <div key={index} className="photo-card">
                  <div className="photo-preview">
                    <img 
                      src={photo.url} 
                      alt={photo.key}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="photo-error" style={{ display: 'none' }}>
                      <span>🖼️</span>
                      <span>Preview unavailable</span>
                    </div>
                  </div>
                  <div className="photo-info">
                    <div className="photo-name">
                      {photo.key.length > 30 
                        ? photo.key.substring(0, 30) + '...' 
                        : photo.key
                      }
                    </div>
                    <div className="photo-meta">
                      Size: {formatFileSize(photo.size)}<br/>
                      Uploaded: {formatDate(photo.lastModified)}
                    </div>
                    <div className="photo-actions">
                      <button 
                        className="action-button view-button"
                        onClick={() => window.open(photo.url, '_blank')}
                      >
                        View
                      </button>
                      <button 
                        className="action-button delete-button"
                        onClick={() => deletePhoto(photo.key)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
