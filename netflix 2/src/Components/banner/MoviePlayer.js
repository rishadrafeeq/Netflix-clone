import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { TMDB_BASE_URL, TMDB_API_KEY } from '../../Constants/constants';
import './MoviePlayer.css';

function MoviePlayer({ movieId, movieTitle, isVisible, onClose, videoSource = 'trailer' }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [streamingProviders, setStreamingProviders] = useState(null);
  const [showProviders, setShowProviders] = useState(false);
  const [currentVideoSource, setCurrentVideoSource] = useState(videoSource);
  const playerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isVisible && (movieId || movieTitle)) {
      fetchVideo();
      if (currentVideoSource === 'streaming') {
        fetchStreamingProviders();
      }
    } else {
      setVideoUrl(null);
      setError(null);
      setIsPlaying(false);
      setStreamingProviders(null);
    }
  }, [isVisible, movieId, movieTitle, currentVideoSource]);

  const fetchStreamingProviders = async () => {
    if (!movieId) return;
    
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_API_KEY}`
        }
      };

      const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers`, options);
      const data = await response.json();
      
      if (isMountedRef.current && data.results) {
        // Get US providers (you can change this to other regions)
        const usProviders = data.results.US || data.results.US || {};
        setStreamingProviders(usProviders);
      }
    } catch (error) {
      console.error('Error fetching streaming providers:', error);
    }
  };

  const fetchVideo = async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (currentVideoSource === 'trailer') {
        // Fetch trailer from TMDB
        await fetchTrailer();
      } else if (currentVideoSource === 'streaming') {
        // Show streaming providers instead of error
        setShowProviders(true);
        setLoading(false);
        return;
      } else if (currentVideoSource === 'demo') {
        // Demo video for testing
        setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      setError('Failed to load video');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const fetchTrailer = async () => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`
      }
    };

    let url;
    if (movieId) {
      url = `${TMDB_BASE_URL}/movie/${movieId}/videos?language=en-US`;
    } else if (movieTitle) {
      url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(movieTitle)}&language=en-US&page=1`;
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    if (movieId) {
      if (data.results && data.results.length > 0) {
        const trailer = data.results.find(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        ) || data.results[0];
        
        if (trailer) {
          const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
          setVideoUrl(youtubeUrl);
        } else {
          setError('No trailer available');
        }
      } else {
        setError('No trailer available');
      }
    } else if (movieTitle) {
      if (data.results && data.results.length > 0) {
        const firstMovie = data.results[0];
        const videoResponse = await fetch(`${TMDB_BASE_URL}/movie/${firstMovie.id}/videos?language=en-US`, options);
        const videoData = await videoResponse.json();
        
        if (videoData.results && videoData.results.length > 0) {
          const trailer = videoData.results.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
          ) || videoData.results[0];
          
          if (trailer) {
            const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            setVideoUrl(youtubeUrl);
          } else {
            setError('No trailer available');
          }
        } else {
          setError('No trailer available');
        }
      } else {
        setError('Movie not found');
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleProgress = (state) => {
    setProgress(state.played);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (playerRef.current) {
      playerRef.current.seekTo(percent);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStreamingProviders = () => {
    if (!streamingProviders) return null;

    const { flatrate = [], rent = [], buy = [], free = [] } = streamingProviders;

    return (
      <div className="streaming-providers-container">
        <h3>Where to Watch</h3>
        
        {flatrate.length > 0 && (
          <div className="provider-section">
            <h4>Streaming</h4>
            <div className="providers-grid">
              {flatrate.map(provider => (
                <div key={provider.provider_id} className="provider-item">
                  <img 
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="provider-logo"
                  />
                  <span className="provider-name">{provider.provider_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {free.length > 0 && (
          <div className="provider-section">
            <h4>Free</h4>
            <div className="providers-grid">
              {free.map(provider => (
                <div key={provider.provider_id} className="provider-item">
                  <img 
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="provider-logo"
                  />
                  <span className="provider-name">{provider.provider_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {rent.length > 0 && (
          <div className="provider-section">
            <h4>Rent</h4>
            <div className="providers-grid">
              {rent.map(provider => (
                <div key={provider.provider_id} className="provider-item">
                  <img 
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="provider-logo"
                  />
                  <span className="provider-name">{provider.provider_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {buy.length > 0 && (
          <div className="provider-section">
            <h4>Buy</h4>
            <div className="providers-grid">
              {buy.map(provider => (
                <div key={provider.provider_id} className="provider-item">
                  <img 
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="provider-logo"
                  />
                  <span className="provider-name">{provider.provider_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {flatrate.length === 0 && free.length === 0 && rent.length === 0 && buy.length === 0 && (
          <div className="no-providers">
            <p>No streaming providers available for this movie.</p>
            <button 
              className="movie-player-demo-btn"
              onClick={() => {
                setCurrentVideoSource('demo');
                setShowProviders(false);
              }}
            >
              Play Demo Video Instead
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="movie-player-overlay" onClick={onClose}>
      <div className="movie-player-container" onClick={(e) => e.stopPropagation()}>
        <button className="movie-player-close-btn" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="movie-player-loading">Loading video...</div>
        ) : showProviders ? (
          renderStreamingProviders()
        ) : error ? (
          <div className="movie-player-error">
            <div>{error}</div>
            <button 
              className="movie-player-demo-btn"
              onClick={() => {
                setCurrentVideoSource('demo');
                setError(null);
              }}
            >
              Play Demo Video
            </button>
          </div>
        ) : videoUrl ? (
          <div className="movie-player-video-container">
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              width="100%"
              height="100%"
              playing={isPlaying}
              muted={isMuted}
              volume={volume}
              controls={false}
              onPlay={handlePlay}
              onPause={handlePause}
              onProgress={handleProgress}
              onDuration={handleDuration}
              config={{
                youtube: {
                  playerVars: {
                    autoplay: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    controls: 0
                  }
                }
              }}
            />
            
            {/* Custom Controls */}
            <div className="movie-player-controls">
              <div className="movie-player-progress-bar" onClick={handleSeek}>
                <div 
                  className="movie-player-progress-fill" 
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
              
              <div className="movie-player-controls-bottom">
                <div className="movie-player-controls-left">
                  <button 
                    className="movie-player-control-btn"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <span className="movie-player-time">
                    {formatTime(progress * duration)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="movie-player-controls-right">
                  <div className="movie-player-volume-control">
                    <button 
                      className="movie-player-control-btn"
                      onClick={handleMuteToggle}
                    >
                      {isMuted ? '🔇' : '🔊'}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="movie-player-volume-slider"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="movie-player-no-video">No video available</div>
        )}
      </div>
    </div>
  );
}

export default MoviePlayer; 