import React, { useState, useEffect } from 'react';
import './Group.css';

const GroupsManagement = () => {
  const [groups, setGroups] = useState([]);
  const [folderCounts, setFolderCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [currentGroupName, setCurrentGroupName] = useState('');
  const [members, setMembers] = useState([]);
  const [groupFolders, setGroupFolders] = useState([]);
  const [activeTab, setActiveTab] = useState('members');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [memberUsernames, setMemberUsernames] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const token = localStorage.getItem('jwtToken');

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      window.location.href = '/index.html';
    } else {
      loadGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'is-info') => {
    setNotification({ message, type });
  };

  const showLoading = () => {
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  // Load groups created by the user
  const loadGroups = async () => {
    showLoading();
    try {
      const res = await fetch('https://hackclub.maksimmalbasa.in.rs/api/show-group-I-created', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch groups');
      }
      const groupsData = await res.json();
      setGroups(groupsData || []);
      // Reset folder counts before fetching
      const newFolderCounts = {};
      setFolderCounts(newFolderCounts);
      // Fetch folder count for each group
      if (groupsData && groupsData.length > 0) {
        groupsData.forEach((group) => {
          fetchFolderCount(group.groupId);
        });
      }
    } catch (err) {
      console.error('Error loading groups:', err);
      showNotification('Failed to load groups', 'is-danger');
      setGroups([]);
      setFolderCounts({});
    } finally {
      hideLoading();
    }
  };

  // Fetch folder count (number of folder permissions) for a given group
  const fetchFolderCount = async (groupId) => {
    try {
      const permsRes = await fetch(`https://hackclub.maksimmalbasa.in.rs/api/show-groups-permissions?groupId=${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!permsRes.ok) {
        throw new Error(`Failed to fetch permissions for group ${groupId}`);
      }
      const permsData = await permsRes.json();
      const folderCount = Object.keys(permsData.permissions).length;
      setFolderCounts((prev) => ({
        ...prev,
        [groupId]: folderCount,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Handle form submission to create a new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    showLoading();

    const trimmedGroupName = groupName.trim();
    const memberList = memberUsernames
      .split('\n')
      .map((username) => username.trim())
      .filter((username) => username);

    if (trimmedGroupName.length < 3 || trimmedGroupName.length > 50) {
      showNotification('Group name must be between 3 and 50 characters', 'is-warning');
      hideLoading();
      return;
    }

    if (memberList.length < 2) {
      showNotification('Please enter at least 2 usernames', 'is-warning');
      hideLoading();
      return;
    }

    try {
      const res = await fetch('https://hackclub.maksimmalbasa.in.rs/api/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupName: trimmedGroupName,
          memberUsernames: memberList,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      await res.json();
      showNotification('Group created successfully!', 'is-success');
      setGroupName('');
      setMemberUsernames('');
      loadGroups();
    } catch (err) {
      showNotification(err.message, 'is-danger');
    } finally {
      hideLoading();
    }
  };

  // Open modal and load group details (members, folders, permissions)
  const openGroupDetails = async (groupId, groupName) => {
    setCurrentGroupId(groupId);
    setCurrentGroupName(groupName);
    setActiveTab('members');
    setMembers([]);
    setGroupFolders([]);
    setSelectedFolderId('');
    setShowModal(true);
    showLoading();

    try {
      // Fetch group members
      const membersRes = await fetch(`https://hackclub.maksimmalbasa.in.rs/api/groups/members/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!membersRes.ok) {
        throw new Error('Failed to load group members');
      }
      const membersData = await membersRes.json();
      setMembers(membersData.members);

      // Fetch all folders owned by the user
      const foldersRes = await fetch('https://hackclub.maksimmalbasa.in.rs/api/my-folders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!foldersRes.ok) {
        throw new Error('Failed to load your folders');
      }
      const foldersData = await foldersRes.json();

      // For each folder, fetch current permissions for this group
      const folderPermPromises = foldersData.map(async (folder) => {
        const currentPermsRes = await fetch(
          `https://hackclub.maksimmalbasa.in.rs/api/groups/view-current-permissions/${groupId}/${folder.folderId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );
        if (!currentPermsRes.ok) {
          throw new Error(`Failed to load permissions for folder ${folder.folderId}`);
        }
        const currentPerms = await currentPermsRes.json();
        return {
          folderId: folder.folderId,
          folderName: folder.folderName,
          permissions: { ...currentPerms.permissions },
        };
      });

      const folderPermsArray = await Promise.all(folderPermPromises);
      setGroupFolders(folderPermsArray);
    } catch (err) {
      showNotification('Failed to load group details', 'is-danger');
      setShowModal(false);
    } finally {
      hideLoading();
    }
  };

  // Close modal and reload groups to update counts or state
  const closeModal = () => {
    setShowModal(false);
    loadGroups();
  };

  // Handle adding a folder permission to the current group
  const handleAddFolder = async () => {
    if (!selectedFolderId) {
      showNotification('Please select a folder', 'is-warning');
      return;
    }

    showLoading();
    try {
      const res = await fetch(
        `https://hackclub.maksimmalbasa.in.rs/api/folders/${selectedFolderId}/groups/${currentGroupId}/permissions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            view: true,
            download: false,
          }),
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      showNotification('Folder permission added successfully', 'is-success');
      // Refresh group details to reflect new permission
      openGroupDetails(currentGroupId, currentGroupName);
    } catch (err) {
      showNotification(err.message, 'is-danger');
    } finally {
      hideLoading();
    }
  };

  // Handle toggling a specific permission for a folder in the current group
  const updateFolderPermission = async (folderId, permission, value) => {
    showLoading();
    try {
      const res = await fetch(
        `https://hackclub.maksimmalbasa.in.rs/api/folders/${folderId}/groups/${currentGroupId}/permissions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            [permission]: value,
          }),
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      showNotification('Permission updated successfully', 'is-success');
      // Update state locally for the changed permission
      setGroupFolders((prevFolders) =>
        prevFolders.map((f) => {
          if (f.folderId === folderId) {
            return {
              ...f,
              permissions: {
                ...f.permissions,
                [permission]: value,
              },
            };
          }
          return f;
        })
      );
    } catch (err) {
      showNotification(err.message, 'is-danger');
      // If error, reload the modal content
      openGroupDetails(currentGroupId, currentGroupName);
    } finally {
      hideLoading();
    }
  };

  // Compute folders that have no permissions yet (for the "Add Folder Permission" select)
  const availableFolders = groupFolders.filter((f) => {
    return !Object.values(f.permissions).some((v) => v === true);
  });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/index.html';
  };

  return (
    <>
      {/* Notification */}
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          <button className="delete" onClick={() => setNotification({ message: '', type: '' })}></button>
          <span className="icon-text">
            <span className="icon">
              <i
                className={`fas ${
                  notification.type === 'is-danger'
                    ? 'fa-exclamation-circle'
                    : notification.type === 'is-warning'
                    ? 'fa-exclamation-triangle'
                    : notification.type === 'is-success'
                    ? 'fa-check-circle'
                    : 'fa-info-circle'
                }`}
              ></i>
            </span>
            <span>{notification.message}</span>
          </span>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="loading">
          <div className="box">
            <span className="icon is-large has-text-primary">
              <i className="fas fa-spinner fa-pulse fa-2x"></i>
            </span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <a className="navbar-item" href="/dashboard.html">
              <i className="fas fa-share-alt"></i>
              <span className="ml-2">FileShare</span>
            </a>
          </div>
          <div className="navbar-end">
            <a className="navbar-item" href="/dashboard/dashboard.html">
              <i className="fas fa-folder"></i>
              <span className="ml-2">My Folders</span>
            </a>
            <a className="navbar-item" href="#" id="logoutBtn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span className="ml-2">Logout</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <section className="section">
        <div className="container">
          <div className="columns">
            {/* Create Group Form */}
            <div className="column is-4">
              <div className="box">
                <h2 className="title is-4">
                  <span className="icon-text">
                    <span className="icon">
                      <i className="fas fa-plus-circle"></i>
                    </span>
                    <span>Create New Group</span>
                  </span>
                </h2>
                <form id="createGroupForm" onSubmit={handleCreateGroup}>
                  <div className="field">
                    <label className="label" htmlFor="groupName">
                      Group Name
                    </label>
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="text"
                        id="groupName"
                        required
                        pattern="[\w\- ]{3,50}"
                        placeholder="Enter group name"
                        title="3-50 characters, letters, numbers, spaces, hyphens and underscores only"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-users"></i>
                      </span>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="memberUsernames">
                      Member Usernames
                    </label>
                    <div className="control has-icons-left">
                      <textarea
                        className="textarea"
                        id="memberUsernames"
                        placeholder="Enter usernames, one per line"
                        required
                        value={memberUsernames}
                        onChange={(e) => setMemberUsernames(e.target.value)}
                      ></textarea>
                    </div>
                    <p className="help">Enter at least 2 usernames, one per line</p>
                  </div>
                  <div className="field">
                    <div className="control">
                      <button className="button is-primary is-fullwidth" type="submit">
                        <span className="icon">
                          <i className="fas fa-users"></i>
                        </span>
                        <span>Create Group</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Groups List */}
            <div className="column is-8">
              <div className="box">
                <h2 className="title is-4">
                  <span className="icon-text">
                    <span className="icon">
                      <i className="fas fa-users"></i>
                    </span>
                    <span>My Groups</span>
                  </span>
                </h2>
                <div id="groupsList">
                  {groups.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-users-slash"></i>
                      <p>You haven't created any groups yet.</p>
                      <p className="mt-2">Create a new group to start sharing your folders with others.</p>
                    </div>
                  ) : (
                    groups.map((group) => {
                      const memberCount = group.members.length;
                      const count = folderCounts[group.groupId] ?? '-';
                      return (
                        <div className="card group-card mb-4" key={group.groupId}>
                          <header className="card-header">
                            <p className="card-header-title">
                              <span className="icon mr-2">
                                <i className="fas fa-users"></i>
                              </span>
                              {group.groupName}
                            </p>
                          </header>
                          <div className="card-content">
                            <div className="content">
                              <div className="group-members-preview">
                                {group.members.slice(0, 5).map((member) => (
                                  <span className="tag is-info member-tag" key={member.username}>
                                    <span className="icon is-small mr-1">
                                      <i className="fas fa-user"></i>
                                    </span>
                                    {member.username}
                                  </span>
                                ))}
                                {memberCount > 5 && (
                                  <span className="tag is-info member-tag">+{memberCount - 5} more</span>
                                )}
                              </div>

                              <div className="group-stats">
                                <div className="group-stat">
                                  <strong>{memberCount}</strong>
                                  Members
                                </div>
                                <div className="group-stat">
                                  <strong>{count}</strong>
                                  Folders
                                </div>
                              </div>

                              <button
                                className="button is-primary is-fullwidth mt-4"
                                onClick={() => openGroupDetails(group.groupId, group.groupName)}
                              >
                                <span className="icon">
                                  <i className="fas fa-cog"></i>
                                </span>
                                <span>Manage Group</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Group Details Modal */}
      {showModal && (
        <div className="modal is-active" id="groupModal">
          <div className="modal-background" onClick={closeModal}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">
                <span className="icon">
                  <i className="fas fa-users"></i>
                </span>
                <span id="modalGroupName">{currentGroupName}</span>
              </p>
              <button className="delete" aria-label="close" onClick={closeModal}></button>
            </header>
            <section className="modal-card-body">
              <div className="tabs is-boxed">
                <ul>
                  <li className={activeTab === 'members' ? 'is-active' : ''}>
                    <a
                      data-tab="members"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab('members');
                      }}
                    >
                      <span className="icon is-small">
                        <i className="fas fa-user"></i>
                      </span>
                      <span>Members</span>
                    </a>
                  </li>
                  <li className={activeTab === 'folders' ? 'is-active' : ''}>
                    <a
                      data-tab="folders"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab('folders');
                      }}
                    >
                      <span className="icon is-small">
                        <i className="fas fa-folder"></i>
                      </span>
                      <span>Folder Permissions</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Members Tab Content */}
              <div
                id="membersTab"
                className="tab-content"
                style={{ display: activeTab === 'members' ? 'block' : 'none' }}
              >
                <div id="membersList" className="mt-4">
                  {members.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-user-slash"></i>
                      <p>This group has no members.</p>
                    </div>
                  ) : (
                    members.map((member) => (
                      <div className="box" key={member.username}>
                        <div className="level">
                          <div className="level-left">
                            <div className="level-item">
                              <span className="icon mr-2 has-text-info">
                                <i className="fas fa-user-circle"></i>
                              </span>
                              <span>{member.username}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Folder Permissions Tab Content */}
              <div
                id="foldersTab"
                className="tab-content"
                style={{ display: activeTab === 'folders' ? 'block' : 'none' }}
              >
                <div className="field">
                  <label className="label" htmlFor="folderSelect">
                    Add Folder Permission
                  </label>
                  <div className="field has-addons">
                    <div className="control is-expanded">
                      <div className="select is-fullwidth">
                        <select
                          id="folderSelect"
                          value={selectedFolderId}
                          onChange={(e) => setSelectedFolderId(e.target.value)}
                        >
                          {availableFolders.length === 0 ? (
                            <option value="">All folders have permissions</option>
                          ) : (
                            <>
                              <option value="">Select a folder</option>
                              {availableFolders.map((folder) => (
                                <option key={folder.folderId} value={folder.folderId}>
                                  {folder.folderName}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="control">
                      <button className="button is-primary" id="addFolderBtn" onClick={handleAddFolder}>
                        <span className="icon">
                          <i className="fas fa-plus"></i>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <div id="folderPermissions" className="mt-4">
                  {groupFolders.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-folder-open"></i>
                      <p>You don't have any folders to share.</p>
                      <p className="mt-2">Create a folder first to share with this group.</p>
                    </div>
                  ) : (
                    groupFolders.map((folder) => (
                      <div className="box folder-permission" key={folder.folderId}>
                        <div className="level">
                          <div className="level-left">
                            <div className="level-item">
                              <span className="icon mr-2 has-text-primary">
                                <i className="fas fa-folder"></i>
                              </span>
                              <span>{folder.folderName}</span>
                            </div>
                          </div>
                          <div className="level-right">
                            <div className="level-item">
                              <div className="field is-grouped">
                                <label className="checkbox mr-4">
                                  <input
                                    type="checkbox"
                                    checked={folder.permissions.view}
                                    onChange={(e) =>
                                      updateFolderPermission(
                                        folder.folderId,
                                        'view',
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="icon-text">
                                    <span className="icon is-small has-text-info">
                                      <i className="fas fa-eye"></i>
                                    </span>
                                    <span>View</span>
                                  </span>
                                </label>
                                <label className="checkbox mr-4">
                                  <input
                                    type="checkbox"
                                    checked={folder.permissions.download}
                                    onChange={(e) =>
                                      updateFolderPermission(
                                        folder.folderId,
                                        'download',
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="icon-text">
                                    <span className="icon is-small has-text-success">
                                      <i className="fas fa-download"></i>
                                    </span>
                                    <span>Download</span>
                                  </span>
                                </label>
                                <label className="checkbox mr-4">
                                  <input
                                    type="checkbox"
                                    checked={folder.permissions.upload}
                                    onChange={(e) =>
                                      updateFolderPermission(
                                        folder.folderId,
                                        'upload',
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="icon-text">
                                    <span className="icon is-small has-text-warning">
                                      <i className="fas fa-upload"></i>
                                    </span>
                                    <span>Upload</span>
                                  </span>
                                </label>
                                <label className="checkbox">
                                  <input
                                    type="checkbox"
                                    checked={folder.permissions.delete}
                                    onChange={(e) =>
                                      updateFolderPermission(
                                        folder.folderId,
                                        'delete',
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="icon-text">
                                    <span className="icon is-small has-text-danger">
                                      <i className="fas fa-trash"></i>
                                    </span>
                                    <span>Delete</span>
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button className="button" id="closeModalBtn" onClick={closeModal}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupsManagement;

