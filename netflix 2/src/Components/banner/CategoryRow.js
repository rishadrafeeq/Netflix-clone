import React, { useEffect, useState, useRef, useCallback } from 'react';
import './CategoryRow.css';
import { OMDB_API_KEY, OMDB_BASE_URL } from '../../Constants/constants';
import VideoPreview from './VideoPreview';

const defaultImage = 'https://image.tmdb.org/t/p/original/1E5baAaEse26fej7uHcjOgEE2t2.jpg';

function CategoryRow({ title, movieTitles }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const autoScrollTimeoutRef = useRef(null);
  
  // Video preview states
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [previewMovieTitle, setPreviewMovieTitle] = useState(null);
  const [isPreviewMuted, setIsPreviewMuted] = useState(true);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all(
      movieTitles.map(name =>
        fetch(`${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(name)}`)
          .then(res => res.json())
          .then(data => (data.Response === 'True' ? data : null))
          .catch(() => null)
      )
    ).then(results => {
      if (isMounted) {
        setMovies(results.filter(Boolean));
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [movieTitles]);

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
  const handlePlayButtonHover = (movieTitle) => {
    setPreviewMovieTitle(movieTitle);
    setIsPreviewMuted(true);
    setIsPreviewPlaying(true);
    setShowVideoPreview(true);
  };

  const handlePlayButtonClick = (movieTitle) => {
    setPreviewMovieTitle(movieTitle);
    setIsPreviewMuted(false);
    setIsPreviewPlaying(true);
    setShowVideoPreview(true);
  };

  const handleCloseVideoPreview = () => {
    setShowVideoPreview(false);
    setIsPreviewPlaying(false);
    setPreviewMovieTitle(null);
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
                      handlePlayButtonHover(movie.Title);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayButtonClick(movie.Title);
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
      {showVideoPreview && previewMovieTitle && (
        <VideoPreview
          movieTitle={previewMovieTitle}
          isMuted={isPreviewMuted}
          isPlaying={isPreviewPlaying}
          onClose={handleCloseVideoPreview}
        />
      )}
    </div>
  );
}

export default CategoryRow;