import React, { useState } from 'react';
import '../CSS/OrganizerSignUp.css';



import { IoChevronBack, IoLogoGoogle } from 'react-icons/io5';
import { toast } from 'react-toastify';


import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';




import { OrganizerContext } from '../../../Contexts/OrganizerContext/OrganizerContext';




const OrganizerSignUp = () => {

  const navigate = useNavigate();

  const { backend_URL ,setOrganizerMail, setIsOrganizerLoggedIn } = useContext(OrganizerContext);


  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    organizationName:'',
    phone:'',
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
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.organizationName.trim() || !formData.phone.trim()) return;

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

      const response = await fetch(`${backend_URL}/api/organizer/signup`,fetchOptions);
      const data = await response.json();
      if(data.success){
        toast.success(data.message);
        setOrganizerMail(formData.email);
        navigate('/otp/organizer');
      }else{
        console.log(data);
        toast.error(data.message);
        setIsOrganizerLoggedIn(false);
      }
    }catch(error){
        console.log("Error in Front-End Sign Up Handler ", error);
        toast.error(error);
    }finally{
      setIsSubmitting(false);
    }

    setFormData({ fullName:"", email:"", password:"" , organizationName:"",phone:"" });



  };

  const handleGoogleSignUp = () => {
    // Handle Google signup
    console.log('Google signup initiated');
  };


  const isFormValid = () => {
    return formData.fullName.trim() && 
           formData.email.trim() && 
           formData.password.trim() &&
           formData.organizationName.trim() &&
           formData.phone.trim() ;
  };

  return (
    <div className="organizer-signup-container">
      <div className="organizer-signup-wrapper">
        <button className="organizer-signup-back-button" onClick={()=>{ navigate('/roleSelection') }}>
          <IoChevronBack className="organizer-signup-back-icon" />
          Back to role selection
        </button>

        <div className="organizer-signup-card">
          <div className="organizer-signup-header">
            <h1 className="organizer-signup-title">Organizer Registration</h1>
          </div>

          <form onSubmit={handleSubmit} className="organizer-signup-form">
            <div className="organizer-signup-form-group">
              <label htmlFor="organizerFullName" className="organizer-signup-form-label">
                Organizer Name
              </label>
              <input
                type="text"
                id="organizerFullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="organizer-signup-form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="organizer-signup-form-group">
              <label htmlFor="organizationName" className="organizer-signup-form-label">
                Organization Name
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                className="organizer-signup-form-input"
                placeholder="Enter Organization name"
                required
              />
            </div>

            <div className="organizer-signup-form-group">
              <label htmlFor="organizerEmail" className="organizer-signup-form-label">
                Email
              </label>
              <input
                type="email"
                id="organizerEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="organizer-signup-form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="organizer-signup-form-group">
              <label htmlFor="phone" className="organizer-signup-form-label">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="organizer-signup-form-input"
                placeholder="Enter Organizer Phone Number"
                required
              />
            </div>

            <div className="organizer-signup-form-group">
              <label htmlFor="organizerPassword" className="organizer-signup-form-label">
                Password
              </label>
              <input
                type="password"
                id="organizerPassword"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="organizer-signup-form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="organizer-signup-create-button"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="organizer-signup-divider">
              <span className="organizer-signup-divider-line"></span>
              <span className="organizer-signup-divider-text">or</span>
              <span className="organizer-signup-divider-line"></span>
            </div>

            <button 
              type="button" 
              className="organizer-signup-google-button"
              onClick={handleGoogleSignUp}
            >
              <IoLogoGoogle className="organizer-signup-google-icon" />
              Continue with Google
            </button>

            <div className="organizer-signup-signin-prompt">
              <span className="organizer-signup-signin-text">Already have an account? </span>
              <button 
                type="button" 
                className="organizer-signup-signin-link"
                onClick={()=>{ navigate('/login/organizer') }}
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

export default OrganizerSignUp;
