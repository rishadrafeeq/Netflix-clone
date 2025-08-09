import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link from react-router-dom
import { TMDB_BASE_URL, TMDB_API_KEY, TMDB_IMAGE_URL } from '../../Constants/constants';
import axios from '../../axios';
import './Banner.css';

function Banner() {
  const [movie, setMovie] = useState();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null); // <-- NEW

  const fetchBannerData = () => {
    setIsLoading(true);
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
        if (data.results && data.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.results.length);
          const selectedMovie = data.results[randomIndex];
          const formattedMovie = {
            id: selectedMovie.id,
            title: selectedMovie.title,
            name: selectedMovie.title,
            overview: selectedMovie.overview,
            backdrop_path: `${TMDB_IMAGE_URL}${selectedMovie.backdrop_path}`,
            year: selectedMovie.release_date ? selectedMovie.release_date.split('-')[0] : '',
            rating: (selectedMovie.vote_average / 2).toFixed(1),
            genre: "Popular Movie"
          };
          setMovie(formattedMovie);
        }
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchBannerData();
    const interval = setInterval(() => {
      fetchBannerData();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleMyListClick = () => {
    navigate('/SignIn');
  };

  // NEW: Fetch trailer and show modal
  const handlePlayClick = async () => {
    if (!movie?.id) return;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`
      }
    };
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?language=en-US`, options);
      const data = await response.json();
      const trailer = data.results?.find(
        vid => vid.site === "YouTube" && vid.type === "Trailer"
      );
      if (trailer) {
        setTrailerKey(trailer.key);
      } else {
        setTrailerKey(null);
        alert("No trailer found for this movie.");
      }
    } catch (err) {
      setTrailerKey(null);
      alert("Error fetching trailer.");
    }
  };

  // NEW: Close trailer modal
  const handleCloseTrailer = () => {
    setTrailerKey(null);
  };

  const defaultImage = "https://image.tmdb.org/t/p/original/1E5baAaEse26fej7uHcjOgEE2t2.jpg";
  const bannerStyle = {
    backgroundImage: movie && movie.backdrop_path 
      ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${movie.backdrop_path})` 
      : `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${defaultImage})`
  };

  return (
    <>
      <div 
        className='banner'
        style={bannerStyle}
      >
        <div className='content'>
          <h1 className='title'>{movie ? (movie.title || movie.name) : "Loading..."}</h1>
          {movie && movie.year && (
            <p className='movie-year'>({movie.year})</p>
          )}
          <div className='banner_buttons'>
            <button className='button' onClick={handlePlayClick}>Play</button>
            <button className='button' onClick={handleMyListClick}>My list</button>
          </div>
          <h1 className='description'>{movie ? movie.overview : "Loading movie details..."}</h1>
          {movie && movie.rating && (
            <p className='movie-rating'>⭐ {movie.rating}/10</p>
          )}
        </div>
        <div className="fade_bottom"></div>
      </div>
      {/* NEW: Trailer Modal */}
      {trailerKey && (
        <div className="trailer-modal" style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{position: 'relative', width: '80vw', maxWidth: 800}}>
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Trailer"
            />
            <button onClick={handleCloseTrailer} style={{position: 'absolute', top: 10, right: 10, fontSize: 24, background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer'}}>×</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Banner;