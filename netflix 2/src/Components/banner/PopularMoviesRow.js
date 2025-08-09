import React, { useEffect, useState, useRef, useCallback } from 'react';
import './CategoryRow.css';
import { TMDB_BASE_URL, TMDB_API_KEY, TMDB_IMAGE_URL } from '../../Constants/constants';
import MovieTrailer from './MovieTrailer';
import VideoPreview from './VideoPreview';
import MoviePlayer from './MoviePlayer';

const defaultImage = 'https://image.tmdb.org/t/p/original/1E5baAaEse26fej7uHcjOgEE2t2.jpg';

function PopularMoviesRow({ title }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const autoScrollTimeoutRef = useRef(null);
  
  // Video preview states
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [previewMovieId, setPreviewMovieId] = useState(null);
  const [isPreviewMuted, setIsPreviewMuted] = useState(true);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  
  // Full movie player states
  const [showMoviePlayer, setShowMoviePlayer] = useState(false);
  const [selectedMovieForPlayback, setSelectedMovieForPlayback] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`
      }
    };

    fetch(`${TMDB_BASE_URL}/movie/popular?language=en-US&page=1`, options)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.results) {
          // Format the movie data to match our component structure
          const formattedMovies = data.results.map(movie => ({
            imdbID: movie.id,
            id: movie.id, // Add movie ID for trailer
            Title: movie.title,
            Year: movie.release_date ? movie.release_date.split('-')[0] : '',
            Poster: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : defaultImage,
            imdbRating: (movie.vote_average / 2).toFixed(1), // Convert 10-point scale to 5-point scale
            overview: movie.overview
          }));
          
          setMovies(formattedMovies);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching popular movies:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  // Update scroll button visibility
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const scrollLeft = el.scrollLeft;
    const clientWidth = el.clientWidth;
    const scrollWidth = el.scrollWidth;
    
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [movies, updateScrollButtons]);

  // Update scroll buttons when movies are loaded
  useEffect(() => {
    if (!loading && movies.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        updateScrollButtons();
      }, 100);
    }
  }, [loading, movies, updateScrollButtons]);

  const scrollByAmount = 320; // px

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollByAmount, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollByAmount, behavior: 'smooth' });
    }
  };

  const handleMovieClick = (movieId) => {
    // Add a small delay to prevent interference with auto-scroll
    setTimeout(() => {
      setSelectedMovieId(movieId);
      setShowTrailer(true);
    }, 100);
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
    setSelectedMovieId(null);
  };

  // Video preview handlers
  const handlePlayButtonHover = (movieId) => {
    // Remove automatic playing on hover - just set the movie ID for potential click
    setPreviewMovieId(movieId);
    setIsPreviewMuted(true);
    setIsPreviewPlaying(false); // Don't auto-play on hover
    setShowVideoPreview(false); // Don't show preview on hover
  };

  const handlePlayButtonClick = (movieId) => {
    setPreviewMovieId(movieId);
    setIsPreviewMuted(false);
    setIsPreviewPlaying(true);
    setShowVideoPreview(true);
  };

  const handleCloseVideoPreview = () => {
    setShowVideoPreview(false);
    setIsPreviewPlaying(false);
    setPreviewMovieId(null);
  };

  // Full movie player handlers
  const handlePlayMovie = (movie) => {
    setSelectedMovieForPlayback(movie);
    setShowMoviePlayer(true);
  };

  const handleCloseMoviePlayer = () => {
    setShowMoviePlayer(false);
    setSelectedMovieForPlayback(null);
  };

  // Auto-scroll functionality
  const handleMouseEnter = (index) => {
    // Clear any existing timeout
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }
    
    // Check if this is the last movie in the row
    if (index === movies.length - 1 && canScrollRight) {
      // Set a timeout to auto-scroll right after 1 second of hovering
      autoScrollTimeoutRef.current = setTimeout(() => {
        handleScrollRight();
      }, 1000);
    }
    // Check if this is the first movie in the row
    else if (index === 0 && canScrollLeft) {
      // Set a timeout to auto-scroll left after 1 second of hovering
      autoScrollTimeoutRef.current = setTimeout(() => {
        handleScrollLeft();
      }, 1000);
    }
  };

  const handleMouseLeave = () => {
    // Clear the auto-scroll timeout when mouse leaves
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
      autoScrollTimeoutRef.current = null;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="category-row">
        <h2 className="category-title">{title}</h2>
        <div className="category-row-scroll-container">
          {canScrollLeft && (
            <button className="category-scroll-btn left" onClick={handleScrollLeft} aria-label="Scroll left">
              &#8249;
            </button>
          )}
          {!loading && (
            <div className="category-scroll" ref={scrollRef}>
              {movies.map((movie, idx) => (
                <div
                  className="category-banner"
                  key={movie.imdbID || idx}
                  onClick={() => handleMovieClick(movie.id)}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    className="category-banner-img"
                    src={movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : defaultImage}
                    alt={movie.Title}
                  />
                  <div className="category-banner-info">
                    <div className="category-banner-title">{movie.Title}</div>
                    <div className="category-banner-meta">
                      <span>{movie.Year}</span>
                      {movie.imdbRating && <span>⭐ {movie.imdbRating}</span>}
                    </div>
                  </div>
                  {/* Play button overlay */}
                  <div className="category-banner-overlay">
                    <div className="category-play-buttons">
                      <button
                        className="category-play-btn trailer-btn"
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          handlePlayButtonHover(movie.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayButtonClick(movie.id);
                        }}
                        aria-label="Play trailer"
                        title="Play trailer"
                      >
                        ▶
                      </button>
                      <button
                        className="category-play-btn movie-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayMovie(movie);
                        }}
                        aria-label="Play movie"
                        title="Play full movie"
                      >
                        🎬
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {canScrollRight && (
            <button className="category-scroll-btn right" onClick={handleScrollRight} aria-label="Scroll right">
              &#8250;
            </button>
          )}
        </div>
      </div>
      
      <MovieTrailer 
        movieId={selectedMovieId}
        movieTitle={movies.find(m => m.id === selectedMovieId)?.Title}
        isVisible={showTrailer}
        onClose={handleCloseTrailer}
      />

      <VideoPreview
        movieId={previewMovieId}
        isVisible={showVideoPreview}
        isMuted={isPreviewMuted}
        isPlaying={isPreviewPlaying}
        onClose={handleCloseVideoPreview}
      />

      <MoviePlayer
        movieId={selectedMovieForPlayback?.id}
        movieTitle={selectedMovieForPlayback?.Title}
        isVisible={showMoviePlayer}
        onClose={handleCloseMoviePlayer}
        videoSource="streaming" // Changed to "streaming" to show providers
      />
    </>
  );
}

export default PopularMoviesRow; 