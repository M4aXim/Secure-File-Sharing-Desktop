import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import './DocxViewer.css';

function DocxViewer({ folderId, filename, apiBase }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDocx = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(
          `${apiBase}/view-file/${encodeURIComponent(folderId)}/${encodeURIComponent(filename)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load document');
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setContent(result.value);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading DOCX:', err);
        setError('Failed to load document. Please try again.');
        setIsLoading(false);
      }
    };

    loadDocx();
  }, [folderId, filename, apiBase]);

  if (isLoading) {
    return (
      <div className="docx-viewer-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="docx-viewer-error">
        <i className="fas fa-exclamation-circle"></i>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="docx-viewer">
      <div 
        className="docx-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export default DocxViewer; 