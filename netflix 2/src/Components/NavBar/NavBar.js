import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './NavBar.css'
import { OMDB_API_KEY, OMDB_BASE_URL } from '../../Constants/constants';

function NavBar() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleAvatarClick = () => {
    navigate('/SignIn');
  };

  const handleSearchClick = () => {
    setShowSearch(v => !v);
    setSearchTerm('');
    setResults([]);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const handleSearchChange = e => {
    const value = e.target.value;
    setSearchTerm(value);
    setResults([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!value) return;
    setSearching(true);
    timeoutRef.current = setTimeout(() => {
      fetch(`${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(value)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.Search && Array.isArray(data.Search) ? data.Search : []);
          setSearching(false);
        })
        .catch(() => {
          setResults([]);
          setSearching(false);
        });
    }, 400); // debounce
  };

  const handleResultClick = imdbID => {
    window.open(`https://www.imdb.com/title/${imdbID}/`, '_blank');
  };

  return (
    <div className="navbar">
        <Link to="/" className="logo-link">
            <img
                className="logo"
                src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
                alt="Netflix Logo"
            />
        </Link>
        <div className="navbar-right">
            <button className="search-btn" onClick={handleSearchClick} aria-label="Search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            {showSearch && (
              <div className="search-inline-box">
                <input
                  ref={inputRef}
                  className="search-input"
                  type="text"
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searching && <div className="search-loading">Searching...</div>}
                {!searching && results.length > 0 && (
                  <div className="search-results-inline">
                    {results.map(movie => (
                      <div
                        className="search-result-item"
                        key={movie.imdbID}
                        onClick={() => handleResultClick(movie.imdbID)}
                      >
                        <img
                          src={movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://image.tmdb.org/t/p/original/1E5baAaEse26fej7uHcjOgEE2t2.jpg'}
                          alt={movie.Title}
                          className="search-result-poster"
                        />
                        <div className="search-result-info">
                          <div className="search-result-title">{movie.Title}</div>
                          <div className="search-result-year">{movie.Year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!searching && searchTerm && results.length === 0 && (
                  <div className="search-no-results">No results found.</div>
                )}
              </div>
            )}
            <button className="download-app-btn">Download App</button>
            <img
                className="avatar"
                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                alt="Avatar"
                onClick={handleAvatarClick}
            />
        </div>
    </div>
  )
}

export default NavBar
