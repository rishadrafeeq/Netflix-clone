import React,{useEffect,useState,useRef} from 'react'
import Rawpost from './RawPost.css'
import axios from 'axios'
import { API_KEY,imageUrl } from '../../Constants/constants'

export default function RawPost() {
  const [movies,setMovies] = useState([])
  useEffect(() => {
    axios.get(`discover/tv?api_key=${API_KEY}&with_networks=213.`)
      .then((res) => {
        console.log(res.data.results)
        setMovies(res.data.results)
      })
      .catch((err) => {
        //alert('Error fetching data')
      });
  }, []);
  const postersRef = useRef(null);

  const handleMouseMove = (e) => {
    const { scrollLeft, clientWidth, scrollWidth } = postersRef.current;
    const mouseX = e.clientX - postersRef.current.getBoundingClientRect().left;

    // Check if the cursor is near the right edge
    if (mouseX > clientWidth - 50 && scrollLeft + clientWidth < scrollWidth) {
      postersRef.current.scrollLeft += 10; // Scroll right
    }

    // Check if the cursor is near the left edge
    if (mouseX < 50 && scrollLeft > 0) {
      postersRef.current.scrollLeft -= 10; // Scroll left
    }
  };
  return (
    <div className='raw'>
      <h2>Netflix Originals</h2>
    <div className='posters'
      ref={postersRef}
      onMouseMove={handleMouseMove}>
        
       {movies.map((obj) => (
  <img
    key={obj.id}
    className='poster'
    src={`https://image.tmdb.org/t/p/w500${obj.poster_path}`}
    alt={obj.name || obj.title}
  />
))}
    </div>
    </div>
  )
}
