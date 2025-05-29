import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Folder.css';

function Folder() {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const API_BASE = 'https://hackclub.maksimmalbasa.in.rs/api';

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
  const [friendsList, setFriendsList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [cdnDirectLink, setCdnDirectLink] = useState('');

  // Refs
  const fileInputRef = useRef(null);
  const tempLinkDurationRef = useRef(null);
  const tempLinkUrlRef = useRef(null);

  // Initial auth & data load
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!folderId) {
      navigate('/dashboard');
      return;
    }
    (async () => {
      try {
        // 1) Check if folder is public
        const publicRes = await fetch(`${API_BASE}/is-folder-public/${folderId}`);
        const publicData = await publicRes.json();
        if (!publicData.isPublic) {
          if (!token) {
            navigate('/');
            return;
          }
          // 2) Verify token
          const verifyRes = await fetch(`${API_BASE}/verify-token`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!verifyRes.ok) {
            localStorage.removeItem('jwtToken');
            navigate('/');
            return;
          }
        }
        // 3) Load ownership & contents
        await checkOwnership();
        await fetchFolderContents();
      } catch (err) {
        console.error('Auth check failed:', err);
        showNotification('Failed to access folder. Please try again.', 'is-danger');
        navigate('/dashboard');
      }
    })();
  }, [folderId, navigate]);

  // Update public/private button once owner status is known
  useEffect(() => {
    if (isOwner) updatePublicButtonText();
  }, [isOwner]);

  // Helpers
  function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024,
          sizes = ['Bytes','KB','MB','GB','TB'],
          i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  function formatDate(d) {
    return new Date(d).toLocaleString();
  }

  function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      pdf: 'fa-file-pdf', doc: 'fa-file-word', docx: 'fa-file-word',
      xls: 'fa-file-excel', xlsx: 'fa-file-excel',
      ppt: 'fa-file-powerpoint', pptx: 'fa-file-powerpoint',
      jpg: 'fa-file-image', jpeg: 'fa-file-image', png: 'fa-file-image', gif: 'fa-file-image',
      txt: 'fa-file-alt', zip: 'fa-file-archive', rar: 'fa-file-archive',
      mp3: 'fa-file-audio', mp4: 'fa-file-video',
      html: 'fa-file-code', css: 'fa-file-code', js: 'fa-file-code'
    };
    return icons[ext] || 'fa-file';
  }

  function getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
      svg: 'image/svg+xml',
      mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg',
      mp3: 'audio/mpeg', wav: 'audio/wav',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      js: 'application/javascript', css: 'text/css', html: 'text/html',
      txt: 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  function showNotification(msg, type = 'is-success') {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  }

  // Core functionality
  async function checkOwnership() {
    const token = localStorage.getItem('jwtToken');
    try {
      const res = await fetch(`${API_BASE}/am-I-owner-of-folder/${folderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ownership check failed');
      const data = await res.json();
      setIsOwner(data.isOwner);
    } catch (err) {
      console.error('Error checking ownership:', err);
      setIsOwner(false);
    }
  }

  async function fetchFolderContents() {
    setIsLoading(true);
    const token = localStorage.getItem('jwtToken');
    try {
      const res = await fetch(`${API_BASE}/folder-contents?folderID=${encodeURIComponent(folderId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load folder contents');
      const contents = await res.json();
      setFolderContents(contents);
    } catch (err) {
      console.error('Error loading folder contents:', err);
      showNotification('Failed to load folder contents', 'is-danger');
    } finally {
      setIsLoading(false);
    }
  }

  async function downloadFile(filename) {
    const token = localStorage.getItem('jwtToken');
    try {
      const tRes = await fetch(`${API_BASE}/generate-download-token?folderID=${encodeURIComponent(folderId)}&filename=${encodeURIComponent(filename)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!tRes.ok) throw new Error('No download token');
      const { token: dlToken } = await tRes.json();
      const dlRes = await fetch(`${API_BASE}/download-file?token=${dlToken}`);
      if (!dlRes.ok) throw new Error('Download failed');
      const blob = await dlRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      showNotification(`Downloaded ${filename}`, 'is-success');
    } catch (err) {
      console.error(err);
      showNotification(`Download failed: ${err.message}`, 'is-danger');
    }
  }

  function viewFile(filename) {
    const fileExtension = filename.split('.').pop().toLowerCase();
    if (fileExtension === 'mp4') {
      navigate(`/mp4-player?folderID=${encodeURIComponent(folderId)}&filename=${encodeURIComponent(filename)}`);
    } else {
      navigate(`/media-view?folderID=${encodeURIComponent(folderId)}&filename=${encodeURIComponent(filename)}`);
    }
  }

  async function deleteFile(filename) {
    if (!window.confirm(`Delete ${filename}?`)) return;
    const token = localStorage.getItem('jwtToken');
    try {
      const res = await fetch(`${API_BASE}/delete-file/${encodeURIComponent(folderId)}/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      showNotification(data.message || 'Deleted', 'is-success');
      fetchFolderContents();
    } catch (err) {
      console.error(err);
      showNotification(`Delete failed: ${err.message}`, 'is-danger');
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    setSelectedFile(file);
  }

  async function handleFileUpload() {
    if (!selectedFile) return showNotification('Select a file first', 'is-warning');
    const token = localStorage.getItem('jwtToken');
    const form = new FormData();
    form.append('file', selectedFile);
      const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(pct);
        }
      });
      xhr.onload = () => {
        if (xhr.status === 200) {
        showNotification('Uploaded successfully', 'is-success');
          fetchFolderContents();
          setSelectedFile(null);
          setUploadProgress(0);
        } else {
          const err = JSON.parse(xhr.responseText);
        showNotification(err.message || 'Upload error', 'is-danger');
      }
    };
    xhr.onerror = () => showNotification('Network error', 'is-danger');
    xhr.open('POST', `${API_BASE}/upload-file/${encodeURIComponent(folderId)}`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(form);
  }

  function toggleViewMode() {
    const newMode = !isGridView;
    setIsGridView(newMode);
    localStorage.setItem('gridView', newMode);
  }

  async function exportAsZip() {
    const token = localStorage.getItem('jwtToken');
    showNotification('Preparing ZIP file for download...', 'is-info');
    try {
      const res = await fetch(`${API_BASE}/export-as-zip/${folderId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/zip'
        },
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}`);
      }

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = 'download.zip';
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showNotification('ZIP download started', 'is-success');
    } catch (err) {
      console.error('Export error:', err);
      showNotification(`Failed to export folder: ${err.message}`, 'is-danger');
    }
  }

  async function updatePublicButtonText() {
    try {
      const res = await fetch(`${API_BASE}/is-folder-public/${folderId}`);
      const data = await res.json();
      const btn = document.getElementById('makePublicBtn');
      if (!btn) return;
      if (data.isPublic) {
        btn.innerHTML = '<span class="icon"><i class="fas fa-lock"></i></span><span>Make Private</span>';
        btn.onclick = makePrivate;
        btn.classList.remove('is-success');
        btn.classList.add('is-warning');
      } else {
        btn.innerHTML = '<span class="icon"><i class="fas fa-globe"></i></span><span>Make Public</span>';
        btn.onclick = makePublic;
        btn.classList.remove('is-warning');
        btn.classList.add('is-success');
      }
    } catch (err) {
      console.error('Error checking public status', err);
    }
  }

  async function makePublic() {
    const token = localStorage.getItem('jwtToken');
    try {
      const res = await fetch(`${API_BASE}/make-my-folder-public/${folderId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to make folder public');
      showNotification('Folder is now public', 'is-success');
      updatePublicButtonText();
    } catch (err) {
      console.error(err);
      showNotification('Failed to make folder public', 'is-danger');
    }
  }

  async function makePrivate() {
    const token = localStorage.getItem('jwtToken');
    try {
      const res = await fetch(`${API_BASE}/make-my-folder-private/${folderId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to make folder private');
      showNotification('Folder is now private', 'is-success');
      updatePublicButtonText();
    } catch (err) {
      console.error(err);
      showNotification('Failed to make folder private', 'is-danger');
    }
  }

  function showCdnModalHandler(filename) {
    const fileUrl = `${folderId}:${filename}`;
    const directUrl = `${API_BASE}/v1/file/${fileUrl}`;
    setCdnDirectLink(directUrl);
    setShowCdnModal(true);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Copied to clipboard!', 'is-success');
    } catch (err) {
      console.error('Failed to copy:', err);
      showNotification('Failed to copy to clipboard', 'is-danger');
    }
  }

  function openTempLinkModal(filename) {
    setCurrentTempLinkFilename(filename);
    if (tempLinkUrlRef.current) tempLinkUrlRef.current.value = '';
    setShowTempLinkModal(true);
  }

  async function generateTemporaryLink() {
    const token = localStorage.getItem('jwtToken');
    const hours = parseInt(tempLinkDurationRef.current.value);
    try {
      const res = await fetch(`${API_BASE}/make-a-temporary-download-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ folderId, filename: currentTempLinkFilename, hours })
      });
      if (!res.ok) throw new Error('Failed to generate temporary link');
      const data = await res.json();
      tempLinkUrlRef.current.value = data.url;
    } catch (err) {
      console.error('Error generating temporary link:', err);
      showNotification('Failed to generate temporary link', 'is-danger');
    }
  }

  function copyTempLink() {
    if (tempLinkUrlRef.current) {
      copyToClipboard(tempLinkUrlRef.current.value);
    }
  }

  function closeTempLinkModalHandler() {
    setShowTempLinkModal(false);
    setCurrentTempLinkFilename('');
  }

  async function openPermissionModalHandler() {
    const token = localStorage.getItem('jwtToken');
    try {
      const [friendsRes, permsRes] = await Promise.all([
        fetch(`${API_BASE}/show-friends/${encodeURIComponent(folderId)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/folders/${encodeURIComponent(folderId)}/friends/permissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      const friendsData = await friendsRes.json();
      const permsData = await permsRes.json();
      const list = friendsData.friends || [];
      setFriendsList(list);
      const map = {};
      (permsData.friends || []).forEach(f => { map[f.username] = f.permissions; });
      const init = {};
      list.forEach(u => {
        init[u] = map[u] || { download: false, upload: false, delete: false, addUsers: false };
      });
      setLocalPermissions(init);
      setShowPermissionModal(true);
    } catch (err) {
      console.error('Error loading permissions:', err);
      showNotification('Failed to load permissions', 'is-danger');
    }
  }

  function togglePermission(username, perm) {
    setLocalPermissions(prev => ({
      ...prev,
      [username]: { ...prev[username], [perm]: !prev[username][perm] }
    }));
  }

  async function savePermissionsHandler() {
    const token = localStorage.getItem('jwtToken');
    try {
      for (const user of friendsList) {
        await fetch(`${API_BASE}/folders/${encodeURIComponent(folderId)}/friends/${encodeURIComponent(user)}/permissions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(localPermissions[user])
        });
      }
      showNotification('Permissions updated successfully', 'is-success');
      setShowPermissionModal(false);
    } catch (err) {
      console.error('Error saving permissions:', err);
      showNotification('Failed to save permissions', 'is-danger');
    }
  }

  function closePermissionModalHandler() {
    setShowPermissionModal(false);
  }

  function renderFileItem(file) {
    const name = file.filename;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
    const isVideo = /\.(mp4|webm|mov)$/i.test(name);
    const hasThumbnail = isImage || isVideo;

    if (isGridView) {
      return (
        <div key={name} className="grid-item">
          <div className="thumbnail-container">
            {hasThumbnail
              ? <img
                className="thumbnail" 
                  src={`${API_BASE}/thumbnail/${folderId}/${encodeURIComponent(name)}`}
                  alt={name}
                loading="lazy"
              />
              : <div className="thumbnail-placeholder"><i className={`fas ${getFileIcon(name)}`}></i></div>
            }
          </div>
          <div className="file-name">{name}</div>
          <div className="file-meta">
            <div>{formatFileSize(file.size)}</div>
            <div>{formatDate(file.lastModified)}</div>
          </div>
          <div className="file-actions">
            <button className="button is-small is-info" onClick={() => downloadFile(name)}>
              <span className="icon"><i className="fas fa-download"></i></span>
            </button>
            <button className="button is-small is-primary" onClick={() => viewFile(name)}>
              <span className="icon"><i className="fas fa-eye"></i></span>
            </button>
            <button className="button is-small is-warning" onClick={() => showCdnModalHandler(name)}>
              <span className="icon"><i className="fas fa-link"></i></span><span>CDN</span>
            </button>
            <button className="button is-small is-danger" onClick={() => deleteFile(name)}>
              <span className="icon"><i className="fas fa-trash-alt"></i></span>
            </button>
            {isOwner && (
              <button className="button is-small is-warning" onClick={() => openTempLinkModal(name)}>
                <span className="icon"><i className="fas fa-link"></i></span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={name} className="file-item">
        <div className="file-icon">
          {hasThumbnail
            ? <img
              className="thumbnail" 
                src={`${API_BASE}/thumbnail/${folderId}/${encodeURIComponent(name)}`}
                alt={name}
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
            />
            : <i className={`fas ${getFileIcon(name)}`}></i>
          }
        </div>
        <div className="file-info">
          <span className="file-name">{name}</span>
          <div className="file-meta">
            <span className="file-size">{formatFileSize(file.size)}</span>
            <span className="file-date">{formatDate(file.lastModified)}</span>
          </div>
        </div>
        <div className="file-actions">
          <button className="button is-small is-info" onClick={() => downloadFile(name)}>
            <span className="icon"><i className="fas fa-download"></i></span>
          </button>
          <button className="button is-small is-primary" onClick={() => viewFile(name)}>
            <span className="icon"><i className="fas fa-eye"></i></span>
          </button>
          <button className="button is-small is-warning" onClick={() => showCdnModalHandler(name)}>
            <span className="icon"><i className="fas fa-link"></i></span><span>CDN</span>
          </button>
          <button className="button is-small is-danger" onClick={() => deleteFile(name)}>
            <span className="icon"><i className="fas fa-trash-alt"></i></span>
          </button>
          {isOwner && (
            <button className="button is-small is-warning" onClick={() => openTempLinkModal(name)}>
              <span className="icon"><i className="fas fa-link"></i></span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="folder-container">
      {/* Header */}
      <div className="folder-header">
        <h1>Folder Contents</h1>
        <div className="folder-actions">
          <button className="button" onClick={toggleViewMode}>
            <span className="icon"><i className={`fas ${isGridView ? 'fa-list' : 'fa-th-large'}`}></i></span>
            <span>{isGridView ? 'List View' : 'Grid View'}</span>
          </button>
          {isOwner && (
            <>
              <button className="button is-info" onClick={openPermissionModalHandler}>
                <span className="icon"><i className="fas fa-users"></i></span>
                <span>Manage Permissions</span>
              </button>
              <button
                id="makePublicBtn"
                className="button is-success"
                onClick={makePublic}
              >
                <span className="icon"><i className="fas fa-globe"></i></span>
                <span>Make Public</span>
              </button>
              <button className="button is-warning" onClick={exportAsZip}>
                <span className="icon"><i className="fas fa-file-archive"></i></span>
                <span>Export ZIP</span>
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
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <button className="button is-primary" onClick={() => fileInputRef.current.click()}>
          <span className="icon"><i className="fas fa-upload"></i></span>
          <span>Select File</span>
        </button>
        {selectedFile && (
          <div className="selected-file">
            <span>{selectedFile.name}</span>
            <button className="button is-success" onClick={handleFileUpload}>
              <span className="icon"><i className="fas fa-upload"></i></span>
              <span>Upload</span>
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
          <button
            className="delete"
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          ></button>
          {notification.message}
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Manage Permissions</p>
              <button
                className="delete"
                aria-label="close"
                onClick={closePermissionModalHandler}
              ></button>
            </header>
            <section className="modal-card-body">
              <table className="table is-fullwidth">
                <thead>
                  <tr>
                    <th>Friend</th><th>Download</th><th>Upload</th><th>Delete</th><th>Add Users</th>
                  </tr>
                </thead>
                <tbody>
                  {friendsList.map(user => (
                    <tr key={user}>
                      <td>{user}</td>
                      <td>
                        <button
                          className="button is-small"
                          onClick={() => togglePermission(user, 'download')}
                        >
                          {localPermissions[user]?.download ? '✅' : '❌'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="button is-small"
                          onClick={() => togglePermission(user, 'upload')}
                        >
                          {localPermissions[user]?.upload ? '✅' : '❌'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="button is-small"
                          onClick={() => togglePermission(user, 'delete')}
                        >
                          {localPermissions[user]?.delete ? '✅' : '❌'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="button is-small"
                          onClick={() => togglePermission(user, 'addUsers')}
                        >
                          {localPermissions[user]?.addUsers ? '✅' : '❌'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <footer className="modal-card-foot">
              <button className="button is-success" onClick={savePermissionsHandler}>
                Save
              </button>
              <button className="button" onClick={closePermissionModalHandler}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Temporary Link Modal */}
      {showTempLinkModal && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Generate Temporary Link</p>
              <button
                className="delete"
                aria-label="close"
                onClick={closeTempLinkModalHandler}
              ></button>
            </header>
            <section className="modal-card-body">
              <p><strong>Filename:</strong> {currentTempLinkFilename}</p>
              <div className="field">
                <label className="label">Hours</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    defaultValue="1"
                    ref={tempLinkDurationRef}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Temporary Link</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    ref={tempLinkUrlRef}
                    readOnly
                  />
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button className="button is-success" onClick={generateTemporaryLink}>
                Generate
              </button>
              <button className="button" onClick={copyTempLink}>
                Copy
              </button>
              <button className="button" onClick={closeTempLinkModalHandler}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* CDN Modal */}
      {showCdnModal && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">CDN Link</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => setShowCdnModal(false)}
              ></button>
            </header>
            <section className="modal-card-body">
              <div className="field">
                <label className="label">Direct Link</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    value={cdnDirectLink}
                    readOnly
                  />
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button
                className="button is-success"
                onClick={() => copyToClipboard(cdnDirectLink)}
              >
                Copy
              </button>
              <button className="button" onClick={() => setShowCdnModal(false)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Folder; 
