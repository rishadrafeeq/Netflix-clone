import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { TMDB_BASE_URL, TMDB_API_KEY } from '../../Constants/constants';
import './MovieTrailer.css';

function MovieTrailer({ movieId, isVisible, onClose, type = "movie" }) {
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isVisible && movieId) {
      fetchTrailer();
    } else {
      // Reset state when trailer is closed
      setTrailerUrl(null);
      setIsPlaying(false);
      setIsMuted(true);
    }
  }, [isVisible, movieId]);

  useEffect(() => {
    return () => {
      setIsPlaying(false);
    };
  }, []);

  const fetchTrailer = async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_API_KEY}`
        }
      };

      const response = await fetch(`${TMDB_BASE_URL}/${type}/${movieId}/videos?language=en-US`, options);
      const data = await response.json();
      
      if (isMountedRef.current && data.results && data.results.length > 0) {
        // Find the first trailer (usually the official trailer)
        const trailer = data.results.find(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        ) || data.results[0];
        
        if (trailer) {
          const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
          setTrailerUrl(youtubeUrl);
          // Start playing after a short delay to ensure component is ready
          setTimeout(() => {
            if (isMountedRef.current) {
              setIsPlaying(true);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handlePlayClick = () => {
    if (!isMountedRef.current) return;
    
    setIsMuted(false);
    if (playerRef.current) {
      try {
        playerRef.current.seekTo(0);
      } catch (error) {
        console.error('Error seeking video:', error);
      }
    }
  };

  const handleMouseEnter = () => {
    if (!isMountedRef.current) return;
    
    if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isMountedRef.current) return;
    
    if (!isMuted) {
      setIsMuted(true);
    }
  };

  const handleReady = () => {
    if (isMountedRef.current) {
      setIsPlaying(true);
    }
  };

  const handleError = (error) => {
    console.error('Video player error:', error);
    if (isMountedRef.current) {
      setIsPlaying(false);
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    setTrailerUrl(null);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="movie-trailer-overlay" onClick={handleClose}>
      <div className="movie-trailer-container" onClick={(e) => e.stopPropagation()}>
        <button className="trailer-close-btn" onClick={handleClose}>×</button>
        
        {loading ? (
          <div className="trailer-loading">Loading trailer...</div>
        ) : trailerUrl ? (
          <div className="trailer-video-container">
            <ReactPlayer
              ref={playerRef}
              url={trailerUrl}
              width="100%"
              height="100%"
              playing={isPlaying}
              muted={isMuted}
              controls={true}
              onReady={handleReady}
              onError={handleError}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handlePlayClick}
              config={{
                youtube: {
                  playerVars: {
                    autoplay: 0, // Changed from 1 to 0 to prevent auto-play issues
                    modestbranding: 1,
                    rel: 0
                  }
                }
              }}
            />
            <div className="trailer-controls">
              <button 
                className="trailer-sound-btn"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>
        ) : (
          <div className="trailer-no-trailer">No trailer available</div>
        )}
      </div>
    </div>
  );
}

export default MovieTrailer; 