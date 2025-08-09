import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from './Components/NavBar/NavBar';
import Banner from './Components/banner/Banner';
import CategoryRow from './Components/banner/CategoryRow';
import UpcomingMoviesRow from './Components/banner/UpcomingMoviesRow';
import TopRatedMoviesRow from './Components/banner/TopRatedMoviesRow';
import PopularMoviesRow from './Components/banner/PopularMoviesRow';
import SignIn from './Components/SignIn/Sign';
import Footer from './Components/Footer/Footer';
import FooterEmail from './Components/Footer/FooterEmail';

const thrillerMovies = [
  'Se7en', 'Gone Girl', 'Prisoners', 'Shutter Island', 'The Girl with the Dragon Tattoo', 'Zodiac', 'Nightcrawler', 'Oldboy', 'The Silence of the Lambs', 'Memento'
];

const mostRatedMovies = [
  'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'Pulp Fiction', 'Forrest Gump', 'Inception', 'Fight Club', 'The Lord of the Rings: The Return of the King', 'Interstellar', 'The Matrix'
];

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={
            <>
              <Banner />
              <UpcomingMoviesRow title="Upcoming Movies" />
              <TopRatedMoviesRow title="Top Rated Movies" />
              <PopularMoviesRow title="Popular Movies" />
              <CategoryRow title="Thrilling Movies" movieTitles={thrillerMovies} />
              <CategoryRow title="Most Rated Movies" movieTitles={mostRatedMovies} />
            </>
          } />
          <Route path="/SignIn" element={<SignIn />} />
        </Routes>
        <FooterEmail />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
