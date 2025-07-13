import React, { useState } from 'react';
import '../CSS/PlayerSignUp.css';
import { IoChevronBack, IoCloudUploadOutline, IoCalendarOutline } from 'react-icons/io5';

import {useNavigate} from 'react-router-dom';


import { PlayerContext } from '../../../Contexts/PlayerContext/PlayerContext';
import { useContext } from 'react';
import { toast } from 'react-toastify';



const PlayerSignUp = () => {

  const { backend_URL, isPlayerLoggedIn, setIsPlayerLoggedIn, playerData,setPlayerData, playerMail,setPlayerMail, getAuthStatusPlayer } = useContext(PlayerContext);

  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    dateOfBirth: '',
    aadhaarCard: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        aadhaarCard: file
      }));
      setUploadedFileName(file.name);
    }
  };


  const handleAadhaar = (evt)=>{

    const image = evt.target.files[0];

    if(!image){
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(image);

    reader.onload = async ()=>{
      const base64Image = reader.result;
      // setEditDetails((prev)=>{
      //   return {...prev, profilePic: base64Image};
      // })
      // setFormData(prev => ({
      //   ...prev,
      //   coverImage: base64Image
      // }));

      setFormData(prev => ({
        ...prev,
        aadhaarCard: base64Image
      }));

    }


  }




  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.phoneNumber || !formData.dateOfBirth || !formData.aadhaarCard) return;

    
    // // Simulate API call
    // setTimeout(() => {
      //   console.log('Player registration:', formData);
      //   setIsSubmitting(false);
      // }, 1500);
      
      // console.log(formData);
      
      try{

      setIsSubmitting(true);
      
      const fetchOptions = {
            method:"POST",
            credentials:"include",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify(formData)
      }
      
      const response = await fetch(`${backend_URL}/api/player/signup`,fetchOptions);
      const data = await response.json();
      if(data.success){
        toast.success(data.message);
        setPlayerMail(formData.email);
        navigate('/otp/player');
      }else{
        console.log(data);
        toast.error(data.message);
        setIsPlayerLoggedIn(false);
      }


    }catch(error){
      console.log(`Error in SignUp Handler (Player) ${error}`);
      toast.error(`Error In Sign Up Handler ${error}`);
    }finally{
      setIsSubmitting(false);
    }




  };



  const isFormValid = () => {
    return formData.fullName.trim() && 
           formData.email.trim() && 
           formData.password.trim() && 
           formData.phoneNumber.trim() && 
           formData.dateOfBirth.trim();
  };

  return (
    <div className="player-registration-container">
      <div className="player-registration-wrapper">
        <button className="player-reg-back-button" onClick={()=>{navigate('/roleSelection')}}>
          <IoChevronBack className="player-reg-back-icon" />
          Back to role selection
        </button>

        <div className="player-registration-card">
          <div className="player-registration-header">
            <h1 className="player-registration-title">Player Registration</h1>
          </div>

          <form onSubmit={handleSubmit} className="player-registration-form">
            <div className="player-reg-form-group">
              <label htmlFor="fullName" className="player-reg-form-label">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="player-reg-form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="player-reg-form-group">
              <label htmlFor="email" className="player-reg-form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="player-reg-form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="player-reg-form-group">
              <label htmlFor="password" className="player-reg-form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="player-reg-form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="player-reg-form-group">
              <label htmlFor="phoneNumber" className="player-reg-form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="player-reg-form-input"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="player-reg-form-group">
              <label htmlFor="dateOfBirth" className="player-reg-form-label">
                Date of Birth
              </label>
              <label className="player-reg-date-input-wrapper" htmlFor='dateOfBirth'>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="player-reg-form-input player-reg-date-input"
                  placeholder="mm/dd/yyyy"
                  required
                />
                <IoCalendarOutline className="player-reg-date-icon" />
              </label>
            </div>

            <div className="player-reg-form-group">
              <label htmlFor="aadhaarCard" className="player-reg-form-label">
                Aadhaar Card
              </label>
              <div className="player-reg-file-upload-wrapper">
                <input
                  type="file"
                  id="aadhaarCard"
                  name="aadhaarCard"
                  onChange={handleAadhaar}
                  className="player-reg-file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label htmlFor="aadhaarCard" className="player-reg-file-upload-label">
                  <IoCloudUploadOutline className="player-reg-upload-icon" />
                  {
                    formData.aadhaarCard? 
                    <img src={formData?.aadhaarCard} className="player-reg-upload-text" />:
                    <span className='player-reg-upload-text'>  Upload Aadhaar Card </span>
                  }
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="player-reg-create-button"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="player-reg-signin-prompt">
              <span className="player-reg-signin-text">Already have an account? </span>
              <button 
                type="button" 
                className="player-reg-signin-link"
                onClick={()=>{navigate('/login/player')}}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlayerSignUp;
