import React, { useEffect, useState } from 'react';
import './Hello.css';

const StaffDashboard = () => {
  const [isDark, setIsDark] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const darkPreference = localStorage.getItem('staff_darkmode') === 'true';
    setIsDark(darkPreference);
    if (darkPreference) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    const checkRole = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          window.location.href = '/index.html';
          return;
        }

        const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/check-role', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check role');
        }

        const data = await response.json();

        if (data.role !== 'staff' && data.role !== 'owner') {
          window.location.href = '/index.html';
          return;
        }

        if (data.role === 'owner') {
          setIsOwner(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/index.html';
      }
    };

    checkRole();
  }, []);

  const toggleDark = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.body.classList.toggle('dark', newMode);
    localStorage.setItem('staff_darkmode', newMode);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, Staff</h1>
      <p>Select a tool:</p>
      <ul>
        <li><a href="list-invitations.html" target="_blank">📬 View Pending Invitations</a></li>
        <li><a href="delete-invitation.html" target="_blank">❌ Remove an Invitation</a></li>
        <li><a href="kick-a-friend.html" target="_blank">👢 Kick User from Folder</a></li>
        <li><a href="scan-folder-contents.html" target="_blank">🔍 Scan Folder Metadata</a></li>
        <li><a href="flag-folder.html" target="_blank">🚩 Flag Folder</a></li>
        <li><a href="delete-folder.html" target="_blank">🗑️ Delete Folder</a></li>
        <li><a href="lookup-user.html" target="_blank">👤 Lookup User Info</a></li>
        <li><a href="reset-password.html" target="_blank">🔑 Reset User Password</a></li>
        <li><a href="audit-log.html" target="_blank">📄 View Audit Log</a></li>
        <li><a href="list-of-folders.html" target="_blank">📁 View Folders</a></li>
        <li><a href="stats.html" target="_blank">📊 Stats</a></li>
      </ul>

      {isOwner && (
        <>
          <h2>Owner Only Tools</h2>
          <ul>
            <li><a href="/staff/owner/delete-account.html" target="_blank">⚠️ Delete User Account</a></li>
            <li><a href="/staff/owner/export.html" target="_blank">📥 Export Data</a></li>
            <li><a href="/staff/owner/mass-email.html">📧 Mass Email</a></li>
          </ul>
        </>
      )}

      <div className="toggle" style={{ marginTop: '2rem' }}>
        <button onClick={toggleDark}>🌗 Toggle Dark Mode</button>
      </div>
    </div>
  );
};

export default StaffDashboard;
