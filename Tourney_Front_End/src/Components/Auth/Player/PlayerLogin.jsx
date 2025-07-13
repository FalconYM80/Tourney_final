import React from 'react'

import '../CSS/PlayerLogin.css';

import {useState, useContext} from 'react';
import { IoChevronBack, IoLogoGoogle } from 'react-icons/io5';

import {useNavigate} from 'react-router-dom';
import { PlayerContext } from '../../../Contexts/PlayerContext/PlayerContext';
import { toast } from 'react-toastify';

const PlayerLogin = () => {

  const navigate = useNavigate();
  const { backend_URL, setIsPlayerLoggedIn, getAuthStatusPlayer } = useContext(PlayerContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) return;

    setIsSubmitting(true);
    
    try {
      const fetchOptions = {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      }
      
      const response = await fetch(`${backend_URL}/api/player/login`, fetchOptions);
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setIsPlayerLoggedIn(true);
        getAuthStatusPlayer();
        navigate('/'); // Redirect to home page after successful login
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.log(`Error in Login Handler (Player) ${error}`);
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google login
    toast.info("Google login is not implemented yet");
  };

  

 

  return (
    <div className="player-login-container">
      <div className="player-login-wrapper">
        <button className="player-back-button" onClick={()=>{navigate('/roleSelection')}}>
          <IoChevronBack className="player-back-icon" />
          Back to role selection
        </button>

        <div className="player-login-card">
          <div className="player-login-header">
            <h1 className="player-login-title">Player Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="player-login-form">
            <div className="player-form-group">
              <label htmlFor="playerEmail" className="player-form-label">
                Email
              </label>
              <input
                type="email"
                id="playerEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="player-form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="player-form-group">
              <label htmlFor="playerPassword" className="player-form-label">
                Password
              </label>
              <input
                type="password"
                id="playerPassword"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="player-form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="player-signin-button"
              disabled={isSubmitting || !formData.email.trim() || !formData.password.trim()}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="player-login-divider">
              <span className="player-divider-line"></span>
              <span className="player-divider-text">or</span>
              <span className="player-divider-line"></span>
            </div>

            <button 
              type="button" 
              className="player-google-login-button"
              onClick={handleGoogleLogin}
            >
              <IoLogoGoogle className="player-google-icon" />
              Continue with Google
            </button>

            <div className="player-signup-prompt">
              <span className="player-signup-text">Don't have an account? </span>
              <button 
                type="button" 
                className="player-signup-link"
                onClick={()=>{ navigate('/signup/player') }}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PlayerLogin