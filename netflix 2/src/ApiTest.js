import React, { useState, useEffect } from 'react';
import axios from './axios';
import { API_KEY } from './Constants/constants';

function ApiTest() {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [testImage, setTestImage] = useState(null);

  useEffect(() => {
    // Test API call with different approach
    console.log('Testing API with key:', API_KEY);
    
    // Try direct fetch first
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US`)
      .then(response => {
        console.log('Fetch response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Fetch API Response:', data);
        setApiStatus('API Working with fetch!');
        
        if (data.results && data.results.length > 0) {
          const movie = data.results[0];
          console.log('Test Movie:', movie);
          setTestImage(movie.backdrop_path);
        }
      })
      .catch((err) => {
        console.error('Fetch API Error:', err);
        
        // Fallback to axios
        console.log('Trying axios...');
        axios.get(`movie/popular?api_key=${API_KEY}&language=en-US`)
          .then((res) => {
            console.log('Axios API Response:', res.data);
            setApiStatus('API Working with axios!');
            
            if (res.data.results && res.data.results.length > 0) {
              const movie = res.data.results[0];
              console.log('Test Movie:', movie);
              setTestImage(movie.backdrop_path);
            }
          })
          .catch((axiosErr) => {
            console.error('Axios API Error:', axiosErr);
            setApiStatus(`Both fetch and axios failed: ${err.message}`);
          });
      });
  }, []);

  return (
    <div style={{ padding: '20px', background: '#333', color: 'white' }}>
      <h3>API Test Component</h3>
      <p>Status: {apiStatus}</p>
      {testImage && (
        <div>
          <p>Test Image:</p>
          <img 
            src={`https://image.tmdb.org/t/p/w500${testImage}`}
            alt="Test"
            style={{ width: '200px', height: 'auto' }}
            onLoad={() => console.log('Test image loaded!')}
            onError={(e) => console.error('Test image failed:', e)}
          />
        </div>
      )}
    </div>
  );
}

export default ApiTest; 