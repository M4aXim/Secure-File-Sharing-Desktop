import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Mp4Player.css';

function Mp4Player() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderID');
  const filename = searchParams.get('filename');
  
  // Refs
  const videoRef = useRef(null);
  const mainPlayerContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  const bufferedBarRef = useRef(null);
  const seekContainerRef = useRef(null);
  const notificationAreaRef = useRef(null);
  const keyboardInfoRef = useRef(null);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(parseFloat(localStorage.getItem('mp4viewer_volume')) || 1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(parseFloat(localStorage.getItem('mp4viewer_speed')) || 1);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isLoopActive, setIsLoopActive] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', visible: false });

  useEffect(() => {
    if (!folderId || !filename) {
      showNotification('Missing folderID or filename');
      navigate('/dashboard');
      return;
    }

    // Set document title
    document.title = `Playing: ${decodeURIComponent(filename)}`;

    // Load video
    loadVideo();
    
    // Load saved preferences
    const savedMuted = localStorage.getItem('mp4viewer_muted') === 'true';
    setIsMuted(savedMuted);
    
    // Add event listeners
    const video = videoRef.current;
    if (video) {
      video.muted = savedMuted;
      video.volume = volume;
      video.playbackRate = playbackRate;
    }

    // Cleanup
    return () => {
      if (video) {
        video.pause();
        URL.revokeObjectURL(video.src);
      }
    };
  }, [folderId, filename]);

  const loadVideo = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(
        `https://hackclub.maksimmalbasa.in.rs/api/view-file/${folderId}/${encodeURIComponent(filename)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch video');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (videoRef.current) {
        videoRef.current.src = url;
        storeVideoBlob(blob, `${folderId}_${filename}`);
      }
    } catch (err) {
      console.error('Error loading video:', err);
      showNotification('Failed to load video');
    }
  };

  // Video controls
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    localStorage.setItem('mp4viewer_volume', newVolume);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      localStorage.setItem('mp4viewer_muted', newMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${pct}%`;
      }
      localStorage.setItem(`videoPosition_${folderId}_${filename}`, videoRef.current.currentTime);
    }
  };

  const handleProgress = () => {
    if (videoRef.current && bufferedBarRef.current) {
      if (videoRef.current.buffered.length) {
        const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        const pct = (end / videoRef.current.duration) * 100;
        bufferedBarRef.current.style.width = `${pct}%`;
      }
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current && seekContainerRef.current) {
      const rect = seekContainerRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await mainPlayerContainerRef.current.requestFullscreen();
      } catch (err) {
        showNotification(`Error: ${err.message}`);
      }
    } else {
      document.exitFullscreen();
    }
  };

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else if (document.pictureInPictureEnabled && videoRef.current) {
        await videoRef.current.requestPictureInPicture();
        setIsPipActive(true);
        showNotification('Picture-in-Picture mode active');
      } else {
        showNotification('Picture-in-Picture not supported');
      }
    } catch (err) {
      showNotification(`PiP error: ${err.message}`);
    }
  };

  const takeScreenshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      try {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        const baseName = decodeURIComponent(filename).replace(/\.[^/.]+$/, '');
        a.href = dataURL;
        a.download = `${baseName}_screenshot.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showNotification('Screenshot taken');
      } catch (err) {
        showNotification('Screenshot error');
      }
    }
  };

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      localStorage.setItem('mp4viewer_speed', speed);
      showNotification(`Speed: ${speed}x`);
    }
  };

  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 2000);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    } else {
      return `${mins}:${secs.toString().padStart(2,'0')}`;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          }
          break;
        case 'ArrowRight':
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
          }
          break;
        case 'ArrowUp':
          if (videoRef.current) {
            const newVolume = Math.min(1, videoRef.current.volume + 0.1);
            setVolume(newVolume);
            videoRef.current.volume = newVolume;
          }
          break;
        case 'ArrowDown':
          if (videoRef.current) {
            const newVolume = Math.max(0, videoRef.current.volume - 0.1);
            setVolume(newVolume);
            videoRef.current.volume = newVolume;
          }
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'p':
        case 'P':
          togglePictureInPicture();
          break;
        case 'c':
        case 'C':
          takeScreenshot();
          break;
        case '?':
          setIsHelpOpen(prev => !prev);
          break;
        default:
          if (!isNaN(e.key) && e.key >= '1' && e.key <= '9') {
            if (videoRef.current) {
              const percent = parseInt(e.key) * 10;
              videoRef.current.currentTime = (videoRef.current.duration * percent) / 100;
            }
          }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="mp4-player-container" ref={mainPlayerContainerRef}>
      <video
        ref={videoRef}
        className="video-player"
        onClick={togglePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={() => {
          setDuration(videoRef.current.duration);
          setIsLoading(false);
          const saved = localStorage.getItem(`videoPosition_${folderId}_${filename}`);
          if (saved) {
            const pos = parseFloat(saved);
            if (pos > 0 && pos < videoRef.current.duration - 5) {
              videoRef.current.currentTime = pos;
              showNotification(`Resumed from ${formatTime(pos)}`);
            }
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnterPictureInPicture={() => setIsPipActive(true)}
        onLeavePictureInPicture={() => setIsPipActive(false)}
      />

      {isLoading && (
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      )}

      <div className="video-controls">
        <div className="seek-container" ref={seekContainerRef} onClick={handleSeek}>
          <div className="buffered-bar" ref={bufferedBarRef}></div>
          <div className="progress-bar" ref={progressBarRef}></div>
        </div>

        <div className="control-buttons">
          <button onClick={togglePlayPause}>
            <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
          </button>

          <div className="volume-control">
            <button onClick={toggleMute}>
              <i className={`fas fa-volume-${isMuted ? 'mute' : volume < 0.5 ? 'down' : 'up'}`}></i>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>

          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span> / </span>
            <span>{formatTime(duration)}</span>
          </div>

          <button onClick={togglePictureInPicture} className={isPipActive ? 'active' : ''}>
            <i className="fas fa-external-link-alt"></i>
          </button>

          <button onClick={toggleFullscreen}>
            <i className="fas fa-expand"></i>
          </button>

          <div className="speed-control">
            <button onClick={() => setIsHelpOpen(prev => !prev)}>
              <i className="fas fa-question"></i>
            </button>
            <div className="speed-options">
              {[0.5, 1, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  className={playbackRate === speed ? 'active' : ''}
                  onClick={() => handleSpeedChange(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <button onClick={takeScreenshot}>
            <i className="fas fa-camera"></i>
          </button>

          <button onClick={() => setIsLoopActive(!isLoopActive)} className={isLoopActive ? 'active' : ''}>
            <i className="fas fa-redo"></i>
          </button>
        </div>
      </div>

      {isHelpOpen && (
        <div className="keyboard-info">
          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li><kbd>Space</kbd> Play/Pause</li>
            <li><kbd>←</kbd> -10s</li>
            <li><kbd>→</kbd> +10s</li>
            <li><kbd>↑</kbd> Volume Up</li>
            <li><kbd>↓</kbd> Volume Down</li>
            <li><kbd>M</kbd> Mute</li>
            <li><kbd>F</kbd> Fullscreen</li>
            <li><kbd>P</kbd> Picture-in-Picture</li>
            <li><kbd>C</kbd> Screenshot</li>
            <li><kbd>1-9</kbd> Jump to percentage</li>
          </ul>
        </div>
      )}

      <div className={`notification ${notification.visible ? 'visible' : ''}`}>
        {notification.message}
      </div>
    </div>
  );
}

export default Mp4Player; 