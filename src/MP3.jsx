import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './MP3.css';

function MP3() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderID');
  const filename = searchParams.get('filename');
  
  // Refs
  const audioRef = useRef(null);
  const progressContainerRef = useRef(null);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(parseFloat(localStorage.getItem('mp3_volume')) || 1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [notification, setNotification] = useState({ message: '', visible: false });

  useEffect(() => {
    if (!folderId || !filename) {
      setError('Missing folderID or filename');
      setTimeout(() => navigate('/media'), 2000);
      return;
    }

    // Set document title
    const decodedName = decodeURIComponent(filename);
    document.title = `Playing: ${decodedName}`;

    // Load audio
    loadAudio();
    
    // Add keyboard event listeners
    const handleKeyDown = (e) => {
      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          skipTo(10);
          break;
        case 'ArrowLeft':
          skipTo(-10);
          break;
        case 'ArrowUp':
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [folderId, filename]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem('mp3_volume', volume.toString());
    }
  }, [volume]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      const apiUrl = `https://hackclub.maksimmalbasa.in.rs/api/view-file/${encodeURIComponent(folderId)}/${encodeURIComponent(filename)}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load audio (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setAudioUrl(objectUrl);
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Network error while loading audio');
      setIsLoading(false);
    }
  };

  const initializePlayer = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.volume = volume;
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const setProgress = (e) => {
    if (!audioRef.current || !progressContainerRef.current) return;
    
    const width = progressContainerRef.current.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
  };

  const skipTo = (seconds) => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audioRef.current.currentTime = newTime;
  };

  const audioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return 'fa-volume-mute';
    if (volume < 0.5) return 'fa-volume-down';
    return 'fa-volume-up';
  };

  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 3000);
  };

  if (error) {
    return (
      <div className="mp3-player-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="button is-primary"
            onClick={() => navigate('/media')}
          >
            Back to Media
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mp3-player-container">
      {/* Back Button */}
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
        title="Go back"
      >
        <i className="fas fa-arrow-left"></i>
      </button>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading audio...</p>
        </div>
      )}

      {/* Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={initializePlayer}
          onTimeUpdate={updateProgress}
          onEnded={audioEnded}
        />
      )}

      {/* Player Interface */}
      <div className="audio-player">
        {/* Track Info */}
        <div className={`track-info ${isPlaying ? 'playing' : ''}`}>
          <div className="track-icon">
            <i className="fas fa-music"></i>
          </div>
          <div className="track-details">
            <h1 className="track-title">
              {filename ? decodeURIComponent(filename) : 'Loading...'}
            </h1>
            <p className="track-subtitle">Audio Player</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <span className="time-display current-time">
            {formatTime(currentTime)}
          </span>
          <div 
            className="progress-container"
            ref={progressContainerRef}
            onClick={setProgress}
          >
            <div className="progress-background">
              <div 
                className="progress-bar"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <span className="time-display duration">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="audio-controls">
          {/* Skip Back */}
          <button 
            className="control-button"
            onClick={() => skipTo(-30)}
            title="Skip back 30s"
          >
            <i className="fas fa-backward"></i>
            <span className="skip-text">30</span>
          </button>

          {/* Rewind */}
          <button 
            className="control-button"
            onClick={() => skipTo(-10)}
            title="Rewind 10s"
          >
            <i className="fas fa-undo"></i>
            <span className="skip-text">10</span>
          </button>

          {/* Play/Pause */}
          <button 
            className="control-button play-button"
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>

          {/* Forward */}
          <button 
            className="control-button"
            onClick={() => skipTo(10)}
            title="Forward 10s"
          >
            <i className="fas fa-redo"></i>
            <span className="skip-text">10</span>
          </button>

          {/* Skip Forward */}
          <button 
            className="control-button"
            onClick={() => skipTo(30)}
            title="Skip forward 30s"
          >
            <i className="fas fa-forward"></i>
            <span className="skip-text">30</span>
          </button>
        </div>

        {/* Volume Control */}
        <div className="volume-section">
          <i className={`fas ${getVolumeIcon()} volume-icon`}></i>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
          <span className="volume-display">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="keyboard-shortcuts">
        <p><strong>Keyboard Shortcuts:</strong></p>
        <p>Space: Play/Pause | ← →: Skip 10s | ↑ ↓: Volume</p>
      </div>

      {/* Notification */}
      {notification.visible && (
        <div className="notification-overlay">
          <div className="notification-message">
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default MP3;

