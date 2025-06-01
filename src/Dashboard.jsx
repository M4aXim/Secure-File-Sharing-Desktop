import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('myDrive');
  const [folders, setFolders] = useState([]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [mfaStep, setMfaStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedFiles, setRecommendedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/');
      return;
    }

    // Verify token with server
    fetch('https://hackclub.maksimmalbasa.in.rs/api/verify-token', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        localStorage.removeItem('jwtToken');
        navigate('/');
      } else {
        checkUserRole();
        loadInitialData();
      }
    })
    .catch(() => {
      localStorage.removeItem('jwtToken');
      navigate('/');
    });
  }, [navigate]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadFolders(),
        loadRecommendedFiles()
      ]);
    } catch (error) {
      showNotification('Error loading data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendedFiles = async () => {
    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/recommended-files', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch recommended files');
      
      const data = await response.json();
      setRecommendedFiles(data.recommended || []);
    } catch (error) {
      console.error('Error loading recommended files:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const iconMap = {
      jpg: 'fa-file-image',
      jpeg: 'fa-file-image',
      png: 'fa-file-image',
      gif: 'fa-file-image',
      pdf: 'fa-file-pdf',
      doc: 'fa-file-word',
      docx: 'fa-file-word',
      txt: 'fa-file-alt',
      xls: 'fa-file-excel',
      xlsx: 'fa-file-excel',
      ppt: 'fa-file-powerpoint',
      pptx: 'fa-file-powerpoint',
      mp3: 'fa-file-audio',
      wav: 'fa-file-audio',
      mp4: 'fa-file-video',
      mov: 'fa-file-video',
      zip: 'fa-file-archive',
      rar: 'fa-file-archive',
      js: 'fa-file-code',
      html: 'fa-file-code',
      css: 'fa-file-code'
    };
    return iconMap[extension] || 'fa-file';
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredFolders = folders.filter(folder => 
    folder.folderName.toLowerCase().includes(searchQuery)
  );

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/my-folders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load folders');
      
      const data = await response.json();
      setFolders(data || []);
    } catch (error) {
      showNotification('Failed to load folders', 'error');
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserRole = () => {
    const userRole = localStorage.getItem('userRole');
    const staffNav = document.getElementById('staffNav');
    if (staffNav) {
      staffNav.style.display = userRole === 'staff' ? 'flex' : 'none';
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const handleCreateFolder = async () => {
    const folderName = document.getElementById('folderNameInput').value.trim();
    if (!folderName) {
      showNotification('Please enter a folder name', 'error');
      return;
    }

    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/my-folders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: folderName })
      });

      if (!response.ok) throw new Error('Failed to create folder');

      showNotification('Folder created successfully');
      setShowCreateFolderModal(false);
      loadFolders();
    } catch (error) {
      showNotification('Failed to create folder', 'error');
    }
  };

  const handleChangePassword = async () => {
    const oldPassword = document.getElementById('oldPasswordInput').value;
    const newPassword = document.getElementById('newPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;

    if (!oldPassword || !newPassword || !confirmPassword) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      if (!response.ok) throw new Error('Failed to change password');

      showNotification('Password changed successfully');
      setShowChangePasswordModal(false);
    } catch (error) {
      showNotification('Failed to change password', 'error');
    }
  };

  const handleSetupMFA = async () => {
    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/setup-mfa', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to setup MFA');

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecretKey(data.secretKey);
      setMfaStep(1);
      setShowMFAModal(true);
    } catch (error) {
      showNotification('Failed to setup MFA', 'error');
    }
  };

  const handleVerifyMFA = async () => {
    const token = document.getElementById('mfaTokenInput').value;
    if (!token || token.length !== 6) {
      showNotification('Please enter a valid 6-digit code', 'error');
      return;
    }

    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/mfa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) throw new Error('Failed to verify MFA');

      showNotification('MFA setup completed successfully');
      setShowMFAModal(false);
    } catch (error) {
      showNotification('Failed to verify MFA', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <i className="fas fa-cloud"></i>
          <span>Fileshare</span>
        </div>
        
        <button className="new-folder" onClick={() => setShowCreateFolderModal(true)}>
          <span className="icon"><i className="fas fa-folder-plus"></i></span>
          <span>Create Folder</span>
        </button>
        
        <div className="nav-section">
          <div className="nav-section-title">NAVIGATION</div>
          <div 
            className={`nav-item ${activeSection === 'home' ? 'active' : ''}`} 
            onClick={() => setActiveSection('home')}
          >
            <span className="icon"><i className="fas fa-home"></i></span>
            <span>Home</span>
          </div>
          <div 
            className={`nav-item ${activeSection === 'myDrive' ? 'active' : ''}`} 
            onClick={() => setActiveSection('myDrive')}
          >
            <span className="icon"><i className="fas fa-folder"></i></span>
            <span>My Folders</span>
          </div>
          <div 
            className={`nav-item ${activeSection === 'shared' ? 'active' : ''}`} 
            onClick={() => setActiveSection('shared')}
          >
            {/* <span className="icon"><i className="fas fa-user-friends"></i></span>
            <span>Shared with me</span> */}
          </div>
          <div className="nav-item" onClick={() => navigate('/group')}>
            <span className="icon"><i className="fas fa-users"></i></span>
            <span>Group Management</span>
          </div>
        </div>        
        <div className="nav-section">
          <div className="nav-item" onClick={() => setShowApiKeyModal(true)}>
            <span className="icon"><i className="fas fa-key"></i></span>
            <span>API Keys</span>
          </div>
        </div>
        
        <div className="nav-section">
          <div className="nav-section-title">Staff</div>
          <div className="nav-item" id="staffNav" style={{ display: 'none' }} onClick={() => navigate('/hello')}>
            <span className="icon"><i className="fas fa-user-shield"></i></span>
            <span>Staff Dashboard</span>
          </div>
        </div>
        
        <div className="user-actions">
          <div className="user-action-item" onClick={() => setShowChangePasswordModal(true)}>
            <span className="icon"><i className="fas fa-key"></i></span>
            <span>Change Password</span>
          </div>
          <div className="user-action-item" onClick={handleSetupMFA}>
            <span className="icon"><i className="fas fa-shield-alt"></i></span>
            <span>Setup MFA</span>
          </div>
          <div className="user-action-item">
            <span className="icon"><i className="fas fa-sign-out-alt"></i></span>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: 0, color: 'var(--text-primary)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            {activeSection === 'home' ? 'Home' : 
             activeSection === 'myDrive' ? 'My Folders' : 
             activeSection === 'group' ? 'Group Management' : ''}
          </h1>
          <div className="search-bar" style={{ display: activeSection === 'home' ? 'block' : 'none' }}>
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search files and folders" 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="empty-state">
            <i className="fas fa-spinner fa-spin"></i>
            <h3>Loading...</h3>
            <p>Please wait while we fetch your data</p>
          </div>
        ) : activeSection === 'home' ? (
          <div className="recommended-section">
            <div className="section-title">
              <i className="fas fa-clock"></i>
              Recently Modified Files
            </div>
            <div className="files-container">
              {recommendedFiles.length > 0 ? (
                recommendedFiles.map(file => (
                  <div 
                    key={file._id} 
                    className="file-item"
                    onClick={() => navigate(`/folder/${file.folderId}`)}
                  >
                    <div className={`file-icon ${file.type}`}>
                      <i className={`fas ${getFileIcon(file.filename)}`}></i>
                    </div>
                    <div className="file-details">
                      <div className="file-name">{file.filename}</div>
                      <div className="file-info">
                        <div className="file-size">
                          <i className="fas fa-hdd"></i> {formatFileSize(file.size)}
                        </div>
                        <div className="dot-separator">
                          <i className="fas fa-circle"></i>
                        </div>
                        <div className="file-date">
                          <i className="fas fa-clock"></i> {new Date(file.lastModified).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-file-alt"></i>
                  <h3>No Recent Files</h3>
                  <p>Your recently accessed files will appear here</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="folder-grid">
            {filteredFolders.length > 0 ? (
              filteredFolders.map(folder => (
                <div 
                  key={folder._id} 
                  className="folder-item"
                  onClick={() => navigate(`/folder/${folder.folderId}`)}
                >
                  <i className="folder-icon fas fa-folder"></i>
                  <div className="folder-name">{folder.folderName}</div>
                  <div className="folder-info">
                    {folder.isPublic ? 'Public' : 'Private'} • Last modified {new Date(folder.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-folder-open"></i>
                <h3>No folders found</h3>
                <p>{searchQuery ? 'No folders match your search' : 'Create your first folder to get started'}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateFolderModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-title">Create new folder</div>
            <div className="modal-input-group">
              <label htmlFor="folderNameInput">Folder Name</label>
              <input type="text" className="modal-input" id="folderNameInput" placeholder="Enter folder name" />
            </div>
            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={() => setShowCreateFolderModal(false)}>Cancel</button>
              <button className="modal-button create" onClick={handleCreateFolder}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-title">Change Password</div>
            <div className="modal-input-group">
              <label htmlFor="oldPasswordInput">Current Password</label>
              <input type="password" className="modal-input" id="oldPasswordInput" placeholder="Enter current password" />
            </div>
            <div className="modal-input-group">
              <label htmlFor="newPasswordInput">New Password</label>
              <input type="password" className="modal-input" id="newPasswordInput" placeholder="Enter new password" />
            </div>
            <div className="modal-input-group">
              <label htmlFor="confirmPasswordInput">Confirm New Password</label>
              <input type="password" className="modal-input" id="confirmPasswordInput" placeholder="Confirm new password" />
            </div>
            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={() => setShowChangePasswordModal(false)}>Cancel</button>
              <button className="modal-button submit" onClick={handleChangePassword}>Change Password</button>
            </div>
          </div>
        </div>
      )}

      {showMFAModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-title">Setup Multi-Factor Authentication</div>
            {mfaStep === 1 ? (
              <>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                  Enhance your account security by setting up Multi-Factor Authentication. Scan the QR code with an authenticator app like Google Authenticator or Authy.
                </p>
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid var(--border-light)', borderRadius: '10px', display: 'inline-block' }}>
                    <img src={qrCode} alt="QR Code" style={{ maxWidth: '200px' }} />
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Can't scan? Use this secret key instead:</p>
                  <div style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '10px', borderRadius: '5px', marginTop: '10px', wordBreak: 'break-all', fontSize: '14px' }}>
                    {secretKey}
                  </div>
                </div>
                <div className="modal-buttons">
                  <button className="modal-button cancel" onClick={() => setShowMFAModal(false)}>Cancel</button>
                  <button className="modal-button submit" onClick={() => setMfaStep(2)}>Continue</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                  Enter the verification code from your authenticator app to complete the setup.
                </p>
                <div className="modal-input-group">
                  <label htmlFor="mfaTokenInput">Verification Code</label>
                  <input type="text" className="modal-input" id="mfaTokenInput" placeholder="Enter 6-digit code" maxLength="6" />
                </div>
                <div className="modal-buttons">
                  <button className="modal-button cancel" onClick={() => setMfaStep(1)}>Back</button>
                  <button className="modal-button submit" onClick={handleVerifyMFA}>Verify & Enable</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span className="notification-message">{notification.message}</span>
          <button className="notification-close" onClick={() => setNotification({ show: false, message: '', type: '' })}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 