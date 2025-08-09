import React from 'react';
import './Sign.css';

function SignIn() {
  return (
    <div className="signInContainer">
      <div className="signInForm">
        {          /* Sign In Form */}
        <h2>Sign In</h2>    
        <form>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Sign In</button>
        </form>
       <p>New to Netflix? <a href="/signup">Sign up now</a></p>
        <p>
          This page is protected by Google reCAPTCHA to ensure you're not a bot. 
          <a href="https://policies.google.com/privacy">Learn more</a> about reCAPTCHA.
        </p>
        <div className="socialMediaLogins">
            <button className="facebookLogin">Login with Facebook</button>
            <button className="googleLogin">Login with Google</button>
            <button className="appleLogin">Login with Apple</button>
            <button className="microsoftLogin">Login with Microsoft</button>
            <button className="twitterLogin">Login with Twitter</button>
        </div>
      </div>
    </div>
  );
}

export default SignIn; 