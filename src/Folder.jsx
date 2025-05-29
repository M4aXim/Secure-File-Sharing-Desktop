import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Folder.css';

function Folder() {
  const navigate = useNavigate();
  const { folderId } = useParams();

  // State variables
  const [isGridView, setIsGridView] = useState(localStorage.getItem('gridView') === 'true');
  const [isOwner, setIsOwner] = useState(false);
  const [currentTempLinkFilename, setCurrentTempLinkFilename] = useState('');
  const [folderContents, setFolderContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showTempLinkModal, setShowTempLinkModal] = useState(false);
  const [showCdnModal, setShowCdnModal] = useState(false);
  const [localPermissions, setLocalPermissions] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Refs
  const fileInputRef = useRef(null);
  const cdnDirectLinkRef = useRef(null);
  const tempLinkUrlRef = useRef(null);
  const tempLinkDurationRef = useRef(null);

  // Check authentication and load initial data
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!folderId) {
      navigate('/dashboard');
      return;
    }

    const checkAuth = async () => {
      try {
        // First check if the folder is public
        const publicCheckRes = await fetch(`https://hackclub.maksimmalbasa.in.rs/api/is-folder-public/${folderId}`);
        if (!publicCheckRes.ok) {
          throw new Error(`Public check failed: ${publicCheckRes.status}`);
        }
        const publicData = await publicCheckRes.json();
        
        if (!publicData.isPublic) {
          if (!token) {
            navigate('/');
            return;
          }
          
          // Verify token
          const verifyRes = await fetch('https://hackclub.maksimmalbasa.in.rs/api/verify-token', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!verifyRes.ok) {
            localStorage.removeItem('jwtToken');
            navigate('/');
            return;
          }
        }
        
        await checkOwnership();
        await fetchFolderContents();
      } catch (err) {
        console.error('Auth check failed:', err);
        // Show error to user
        showNotification('Failed to access folder. Please try again.', 'error');
        navigate('/dashboard');
      }
    };

    checkAuth();
  }, [folderId, navigate]);

  // Helper functions
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      pdf: 'fa-file-pdf',
      doc: 'fa-file-word',
      docx: 'fa-file-word',
      xls: 'fa-file-excel',
      xlsx: 'fa-file-excel',
      ppt: 'fa-file-powerpoint',
      pptx: 'fa-file-powerpoint',
      jpg: 'fa-file-image',
      jpeg: 'fa-file-image',
      png: 'fa-file-image',
      gif: 'fa-file-image',
      txt: 'fa-file-alt',
      zip: 'fa-file-archive',
      rar: 'fa-file-archive',
      mp3: 'fa-file-audio',
      mp4: 'fa-file-video',
      html: 'fa-file-code',
      css: 'fa-file-code',
      js: 'fa-file-code'
    };
    return icons[ext] || 'fa-file';
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  // Core functionality
  const checkOwnership = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch(`https://hackclub.maksimmalbasa.in.rs/api/am-I-owner-of-folder/${folderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to check ownership');
      
      const data = await response.json();
      setIsOwner(data.isOwner);
    } catch (error) {
      console.error('Error checking ownership:', error);
      setIsOwner(false);
    }
  };

  const fetchFolderContents = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('jwtToken');
    
    try {
      const res = await fetch(`https://hackclub.maksimmalbasa.in.rs/api/folder-contents?folderID=${encodeURIComponent(folderId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to load folder contents');
      
      const contents = await res.json();
      setFolderContents(contents);
    } catch (err) {
      console.error('Error loading folder contents:', err);
      showNotification('Failed to load folder contents', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (filename) => {
    const token = localStorage.getItem('jwtToken');
    try {
      const tRes = await fetch(`https://hackclub.maksimmalbasa.in.rs/api/generate-download-token?folderID=${encodeURIComponent(folderId)}&filename=${encodeURIComponent(filename)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!tRes.ok) throw new Error('No download token');
      
      const { token: dl } = await tRes.json();
      const dlRes = await fetch(`https://hackclub.maksimmalbasa.in.rs/api/download-file?token=${dl}`);
      
      if (!dlRes.ok) throw new Error(dlRes.statusText);
      
      const blob = await dlRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showNotification(`Downloaded ${filename}`);
    } catch (err) {
      console.error(err);
      showNotification(`Download failed: ${err.message}`, 'error');
    }
  };

  const viewFile = (filename) => {
    navigate(`/media-view?folderID=${encodeURIComponent(folderId)}&filename=${encodeURIComponent(filename)}`);
  };

  const deleteFile = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;
    
    const token = localStorage.getItem('jwtToken');
    try {
      const res = await fetch(`https://hackclub.maksimmalbasa.in.rs/api/delete-file/${encodeURIComponent(folderId)}/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete file');
      
      showNotification('File deleted successfully');
      fetchFolderContents();
    } catch (err) {
      console.error(err);
      showNotification(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showNotification('Select a file first', 'warning');
      return;
    }

    const token = localStorage.getItem('jwtToken');
    const form = new FormData();
    form.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(pct);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          showNotification('Uploaded successfully');
          fetchFolderContents();
          setSelectedFile(null);
          setUploadProgress(0);
        } else {
          const err = JSON.parse(xhr.responseText);
          showNotification(err.message || 'Upload error', 'error');
        }
      };

      xhr.onerror = () => {
        showNotification('Network error', 'error');
      };

      xhr.open('POST', `https://hackclub.maksimmalbasa.in.rs/api/upload-file/${encodeURIComponent(folderId)}`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(form);
    } catch (err) {
      console.error(err);
      showNotification('Upload failed', 'error');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const toggleViewMode = () => {
    const newMode = !isGridView;
    setIsGridView(newMode);
    localStorage.setItem('gridView', newMode);
  };

  // Render functions
  const renderFileItem = (file) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename);
    const isVideo = /\.(mp4|webm|mov)$/i.test(file.filename);
    const hasThumbnail = isImage || isVideo;

    if (isGridView) {
      return (
        <div key={file._id} className="grid-item">
          <div className="thumbnail-container">
            {hasThumbnail ? (
              <img 
                className="thumbnail" 
                src={`/api/thumbnail/${folderId}/${encodeURIComponent(file.filename)}`}
                alt={file.filename}
                loading="lazy"
              />
            ) : (
              <div className="thumbnail-placeholder">
                <i className={`fas ${getFileIcon(file.filename)}`}></i>
              </div>
            )}
          </div>
          <div className="file-name">{file.filename}</div>
          <div className="file-meta">
            <div>{formatFileSize(file.size)}</div>
            <div>{formatDate(file.lastModified)}</div>
          </div>
          <div className="file-actions">
            <button className="button is-small is-info" onClick={() => downloadFile(file.filename)}>
              <span className="icon"><i className="fas fa-download"></i></span>
            </button>
            <button className="button is-small is-primary" onClick={() => viewFile(file.filename)}>
              <span className="icon"><i className="fas fa-eye"></i></span>
            </button>
            <button className="button is-small is-warning" onClick={() => showCdnModal(file.filename)}>
              <span className="icon"><i className="fas fa-link"></i></span>
              <span>CDN</span>
            </button>
            <button className="button is-small is-danger" onClick={() => deleteFile(file.filename)}>
              <span className="icon"><i className="fas fa-trash-alt"></i></span>
            </button>
            {isOwner && (
              <button className="button is-small is-warning" onClick={() => setShowTempLinkModal(true)}>
                <span className="icon"><i className="fas fa-link"></i></span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={file._id} className="file-item">
        <div className="file-icon">
          {hasThumbnail ? (
            <img 
              className="thumbnail" 
              src={`https://hackclub.maksimmalbasa.in.rs/api/thumbnail/${folderId}/${encodeURIComponent(file.filename)}`}
              alt={file.filename}
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
            />
          ) : (
            <i className={`fas ${getFileIcon(file.filename)}`}></i>
          )}
        </div>
        <div className="file-info">
          <span className="file-name">{file.filename}</span>
          <div className="file-meta">
            <span className="file-size">{formatFileSize(file.size)}</span>
            <span className="file-date">{formatDate(file.lastModified)}</span>
          </div>
        </div>
        <div className="file-actions">
          <button className="button is-small is-info" onClick={() => downloadFile(file.filename)}>
            <span className="icon"><i className="fas fa-download"></i></span>
          </button>
          <button className="button is-small is-primary" onClick={() => viewFile(file.filename)}>
            <span className="icon"><i className="fas fa-eye"></i></span>
          </button>
          <button className="button is-small is-warning" onClick={() => showCdnModal(file.filename)}>
            <span className="icon"><i className="fas fa-link"></i></span>
            <span>CDN</span>
          </button>
          <button className="button is-small is-danger" onClick={() => deleteFile(file.filename)}>
            <span className="icon"><i className="fas fa-trash-alt"></i></span>
          </button>
          {isOwner && (
            <button className="button is-small is-warning" onClick={() => setShowTempLinkModal(true)}>
              <span className="icon"><i className="fas fa-link"></i></span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="folder-container">
      {/* Header */}
      <div className="folder-header">
        <h1>Folder Contents</h1>
        <div className="folder-actions">
          <button className="button" onClick={toggleViewMode}>
            <span className="icon">
              <i className={`fas ${isGridView ? 'fa-list' : 'fa-th-large'}`}></i>
            </span>
            <span>{isGridView ? 'List View' : 'Grid View'}</span>
          </button>
          {isOwner && (
            <>
              <button className="button is-info" onClick={() => setShowPermissionModal(true)}>
                <span className="icon"><i className="fas fa-users"></i></span>
                <span>Manage Permissions</span>
              </button>
              <button className="button is-success">
                <span className="icon"><i className="fas fa-globe"></i></span>
                <span>Make Public</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          className="input"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button className="button is-primary" onClick={() => fileInputRef.current?.click()}>
          <span className="icon"><i className="fas fa-upload"></i></span>
          <span>Select File</span>
        </button>
        {selectedFile && (
          <div className="selected-file">
            <span>{selectedFile.name}</span>
            <button className="button is-success" onClick={handleFileUpload}>
              Upload
            </button>
          </div>
        )}
        {uploadProgress > 0 && (
          <progress className="progress is-primary" value={uploadProgress} max="100">
            {uploadProgress}%
          </progress>
        )}
      </div>

      {/* File List */}
      <div className={`folder-contents ${isGridView ? 'grid-view' : 'list-view'}`}>
        {isLoading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading...</span>
          </div>
        ) : folderContents.length === 0 ? (
          <div className="empty-folder">
            <i className="fas fa-folder-open fa-3x"></i>
            <p>This folder is empty</p>
            <p className="is-size-7 has-text-grey">Upload files to get started</p>
          </div>
        ) : (
          folderContents
            .filter(file => file.filename.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(renderFileItem)
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <button className="delete" onClick={() => setNotification({ show: false, message: '', type: '' })}></button>
          {notification.message}
        </div>
      )}

      {/* Modals */}
      {/* Add your modal components here */}
    </div>
  );
}

export default Folder; 