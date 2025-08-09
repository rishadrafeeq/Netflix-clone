import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { TMDB_BASE_URL, TMDB_API_KEY } from '../../Constants/constants';
import './VideoPreview.css';

function VideoPreview({ movieId, movieTitle, isVisible, onClose, isMuted = true, isPlaying = false }) {
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      fetchTrailer();
    } else {
      // Reset state when preview is closed
      setTrailerUrl(null);
      setError(null);
    }
  }, [isVisible, movieId, movieTitle]);

  const fetchTrailer = async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_API_KEY}`
        }
      };

      let url;
      if (movieId) {
        // Use movie ID if available
        url = `${TMDB_BASE_URL}/movie/${movieId}/videos?language=en-US`;
      } else if (movieTitle) {
        // Search by movie title
        url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(movieTitle)}&language=en-US&page=1`;
      } else {
        setError('No movie identifier provided');
        return;
      }

      const response = await fetch(url, options);
      const data = await response.json();
      
      if (isMountedRef.current) {
        if (movieId) {
          // Direct movie ID search
          if (data.results && data.results.length > 0) {
            const trailer = data.results.find(video => 
              video.type === 'Trailer' && video.site === 'YouTube'
            ) || data.results[0];
            
            if (trailer) {
              const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
              setTrailerUrl(youtubeUrl);
            } else {
              setError('No trailer available');
            }
          } else {
            setError('No trailer available');
          }
        } else if (movieTitle) {
          // Search by title, then get videos for the first result
          if (data.results && data.results.length > 0) {
            const firstMovie = data.results[0];
            // Now fetch videos for this movie
            const videoResponse = await fetch(`${TMDB_BASE_URL}/movie/${firstMovie.id}/videos?language=en-US`, options);
            const videoData = await videoResponse.json();
            
            if (videoData.results && videoData.results.length > 0) {
              const trailer = videoData.results.find(video => 
                video.type === 'Trailer' && video.site === 'YouTube'
              ) || videoData.results[0];
              
              if (trailer) {
                const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
                setTrailerUrl(youtubeUrl);
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
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      setError('Failed to load trailer');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleReady = () => {
    // Video is ready to play
  };

  const handleError = (error) => {
    console.error('Video player error:', error);
    setError('Failed to play video');
  };

  if (!isVisible) return null;

  return (
    <div className="video-preview-overlay" onClick={onClose}>
      <div className="video-preview-container" onClick={(e) => e.stopPropagation()}>
        <button className="video-preview-close-btn" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="video-preview-loading">Loading preview...</div>
        ) : error ? (
          <div className="video-preview-error">{error}</div>
        ) : trailerUrl ? (
          <div className="video-preview-video-container">
            <ReactPlayer
              ref={playerRef}
              url={trailerUrl}
              width="100%"
              height="100%"
              playing={isPlaying}
              muted={isMuted}
              controls={false}
              onReady={handleReady}
              onError={handleError}
              config={{
                youtube: {
                  playerVars: {
                    autoplay: isPlaying ? 1 : 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    controls: 0
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="video-preview-no-trailer">No preview available</div>
        )}
      </div>
    </div>
  );
}

export default VideoPreview; 