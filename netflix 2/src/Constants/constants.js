// OMDB API Configuration
export const OMDB_API_KEY = "68a754f2";
export const OMDB_BASE_URL = "http://www.omdbapi.com/";

// TMDB API Configuration
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0OTU3ZGIzMTc3NTU1ZjRhNGM2ZTIyMmI5Y2U2ZTdiZSIsIm5iZiI6MTc1Mzk0NDUzMS4zNjcsInN1YiI6IjY4OGIxMWQzYTBhMTAyMmEyYTk0ODgxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.tPpo46sIrqn-lK53L8tzKm98gqP4Jqfv08sj0kpMJUU";
export const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/original";

// For backward compatibility
export const API_KEY = OMDB_API_KEY;
export const baseUrl = OMDB_BASE_URL;
export const imageUrl = "https://image.tmdb.org/t/p/original"; // OMDB doesn't provide images, we'll need to handle this