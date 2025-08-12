import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch photos on component mount
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/photos');
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setStatusMessage('Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setStatusMessage('');

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('photos', file);
      });

      const response = await axios.post('/api/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      setStatusMessage(response.data.message);
      setUploadProgress(100);
      
      // Refresh photos list
      setTimeout(() => {
        fetchPhotos();
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setStatusMessage(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const deletePhoto = async (key) => {
    try {
      await axios.delete(`/api/photos/${key}`);
      setStatusMessage('Photo deleted successfully');
      fetchPhotos(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      setStatusMessage('Failed to delete photo');
    }
  };

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
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Store2S3</h1>
          <p>Upload and store your photos securely on Amazon S3</p>
        </div>

        <div className="upload-section">
          <h2>Upload Photos</h2>
          
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-text">
              {isDragActive
                ? 'Drop the photos here...'
                : 'Drag & drop photos here, or click to select files'}
            </div>
            <div className="dropzone-subtext">
              Supports: JPEG, PNG, GIF, BMP, WebP (Max: 10MB per file)
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div>{uploadProgress}% uploaded</div>
            </div>
          )}

          {statusMessage && (
            <div className={`status-message ${
              statusMessage.includes('successfully') ? 'success' : 
              statusMessage.includes('Failed') ? 'error' : 'loading'
            }`}>
              {statusMessage}
            </div>
          )}
        </div>

        <div className="upload-section">
          <h2>Your Photos</h2>
          
          {loading ? (
            <div className="status-message loading">
              <span className="loading-spinner"></span>
              Loading photos...
            </div>
          ) : photos.length === 0 ? (
            <div className="status-message">
              No photos uploaded yet. Start by uploading some photos above!
            </div>
          ) : (
            <div className="photos-grid">
              {photos.map((photo) => (
                <div key={photo.key} className="photo-card">
                  <img 
                    src={photo.url} 
                    alt={photo.key}
                    className="photo-image"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
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
      </div>
    </div>
  );
}

export default App;
