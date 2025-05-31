import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DocxViewer from './DocxViewer';
import './MediaView.css';

function MediaView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderID');
  const filename = searchParams.get('filename');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = 'https://hackclub.maksimmalbasa.in.rs/api';

  useEffect(() => {
    if (!folderId || !filename) {
      navigate('/dashboard');
      return;
    }

    const fileExtension = filename.split('.').pop().toLowerCase();
    
    // Handle DOCX files in the current component
    if (fileExtension === 'docx') {
      document.title = `Viewing: ${decodeURIComponent(filename)}`;
      checkFileAccess();
      return;
    }

    // Redirect MP4 files to the dedicated player
    if (fileExtension === 'mp4') {
      navigate(`/mp4-player?folderID=${encodeURIComponent(folderId)}&filename=${encodeURIComponent(filename)}`);
      return;
    }

    // Redirect MP3 files to the dedicated player
    if (fileExtension === 'mp3') {
      navigate(`/mp3?folderID=${encodeURIComponent(folderId)}&filename=${encodeURIComponent(filename)}`);
      return;
    }

    // Set document title
    document.title = `Viewing: ${decodeURIComponent(filename)}`;

    // Check if file exists and is accessible
    checkFileAccess();
  }, [folderId, filename, navigate]);

  const checkFileAccess = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(
        `${API_BASE}/view-file/${folderId}/${encodeURIComponent(filename)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('File not accessible');
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing file:', err);
      setError('Failed to access file. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(
        `${API_BASE}/view-file/${folderId}/${encodeURIComponent(filename)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download file');
    }
  };

  if (isLoading) {
    return (
      <div className="media-view-container">
        <div className="media-view-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="media-view-container">
        <div className="media-view-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button className="button is-primary" onClick={() => navigate('/dashboard')}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const fileExtension = filename.split('.').pop().toLowerCase();
  const isDocx = fileExtension === 'docx';

  return (
    <div className="media-view-container">
      <div className="media-view-header">
        <h1>{decodeURIComponent(filename)}</h1>
        <div className="media-view-actions">
          <button className="button is-primary" onClick={handleDownload}>
            <span className="icon"><i className="fas fa-download"></i></span>
            <span>Download</span>
          </button>
          <button className="button" onClick={() => navigate('/dashboard')}>
            <span className="icon"><i className="fas fa-arrow-left"></i></span>
            <span>Go Back</span>
          </button>
        </div>
      </div>
      <div className="media-view-content">
        {isDocx ? (
          <DocxViewer
            folderId={folderId}
            filename={filename}
            apiBase={API_BASE}
          />
        ) : (
          <iframe
            src={`${API_BASE}/view-file/${folderId}/${encodeURIComponent(filename)}`}
            title={filename}
            className="media-view-iframe"
          />
        )}
      </div>
    </div>
  );
}

export default MediaView; 

