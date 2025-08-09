import React, { useEffect, useState, useRef, useCallback } from 'react';
import './CategoryRow.css';
import { TMDB_BASE_URL, TMDB_API_KEY, TMDB_IMAGE_URL } from '../../Constants/constants';
import VideoPreview from './VideoPreview';

const defaultImage = 'https://image.tmdb.org/t/p/original/1E5baAaEse26fej7uHcjOgEE2t2.jpg';

function UpcomingMoviesRow({ title }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const autoScrollTimeoutRef = useRef(null);
  
  // Video preview states
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [previewMovieId, setPreviewMovieId] = useState(null);
  const [isPreviewMuted, setIsPreviewMuted] = useState(true);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

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

    fetch(`${TMDB_BASE_URL}/movie/upcoming?language=en-US&page=1`, options)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.results) {
          // Format the movie data to match our component structure
          const formattedMovies = data.results.map(movie => ({
            imdbID: movie.id,
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
        console.error('Error fetching upcoming movies:', err);
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
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
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

  // Video preview handlers
  const handlePlayButtonHover = (movieId) => {
    setPreviewMovieId(movieId);
    setIsPreviewMuted(true);
    setIsPreviewPlaying(true);
    setShowVideoPreview(true);
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

  return (
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
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
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
                  <button
                    className="category-play-btn"
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      handlePlayButtonHover(movie.imdbID);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayButtonClick(movie.imdbID);
                    }}
                    aria-label="Play movie"
                  >
                    ▶
                  </button>
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
      {showVideoPreview && previewMovieId && (
        <VideoPreview
          movieId={previewMovieId}
          isMuted={isPreviewMuted}
          isPlaying={isPreviewPlaying}
          onClose={handleCloseVideoPreview}
        />
      )}
    </div>
  );
}

export default UpcomingMoviesRow; 