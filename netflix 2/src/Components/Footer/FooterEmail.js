import React, { useState } from 'react';
import './FooterEmail.css';

function FooterEmail() {
  const [email, setEmail] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    alert(`Get started with: ${email}`);
  };

  return (
    <div className="footer-email-section">
      <h3 className="footer-email-title">
        Ready to watch? Enter your email to create or restart your membership.
      </h3>
      <form className="footer-email-form" onSubmit={handleSubmit}>
        <input
          className="footer-email-input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button className="footer-email-btn" type="submit">
          Get Started <span className="footer-email-arrow">▶</span>
        </button>
      </form>
    </div>
  );
}

export default FooterEmail;