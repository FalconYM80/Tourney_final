import React, { useRef, useContext, useEffect } from 'react';
import './CSS/OTP.css';



import { OrganizerContext } from '../../Contexts/OrganizerContext/OrganizerContext';
// import { useContext } from 'react';




import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';




const OTP = () => {
  const inputRefs = useRef([]);
  const { organizerMail, setIsOrganizerLoggedIn, backend_URL, getAuthStatusOrganizer } = useContext(OrganizerContext);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleNextMove = (evt, ind) => {
    if (evt.target.value.length > 0 && ind < inputRefs.current.length - 1) {
      inputRefs.current[ind + 1].focus();
    }
  };

  const handlePreviousMove = (evt, ind) => {
    if (evt.key === "Backspace" && evt.target.value === "" && ind > 0) {
      inputRefs.current[ind - 1].focus();
    }
  };

  const handlePaste = (evt) => {
    const clipBoardData = evt.clipboardData.getData('text');
    const splittedOTP = clipBoardData.replace(/\D/g, '').split('').slice(0, 6);
    splittedOTP.forEach((char, ind) => {
      if (inputRefs.current[ind]) {
        inputRefs.current[ind].value = char;
      }
    });
    if (splittedOTP.length > 0) {
      inputRefs.current[Math.min(splittedOTP.length, 5)].focus();
    }
  };

  const handleSubmitOTP = async (evt) => {
    evt.preventDefault();
    // You can implement your submit logic here
    let OTP = 0;
    inputRefs.current.forEach((cur)=>{
        OTP = (OTP * 10) + Number(cur.value);
    })
    // console.log(OTP);

        try{
            const fetchOptions = {
                method:"POST",
                credentials:"include",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({organizerMail,OTP}),
            }

            const response = await fetch(`${backend_URL}/api/organizer/verifyEmailWithOTP`,fetchOptions);
            const data = await response.json();

            console.log(data);

            if(data.success){
                toast.success(data.message);
                setIsOrganizerLoggedIn(true);
                getAuthStatusOrganizer();
                navigate('/organizer/home');
            }else{
                toast.error(data.message);
                inputRefs.current[inputRefs.current.length-1].focus();
            }
        }catch(error){
            toast.error(error.message);
            console.log("Error in OTP Organizer");
        }

  };

  return (
    <div className="otp-bg">
      <form className="otp-form" onSubmit={handleSubmitOTP}>
        <h1 className="otp-title">Email Verification</h1>
        <p className="otp-description">Enter the 6-digit code sent to your email</p>
        <div className="otp-inputs" onPaste={handlePaste}>
          {
            Array(6).fill(0).map((_, ind) => (
              <input
                key={ind}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete="one-time-code"
                className="otp-input"
                ref={el => inputRefs.current[ind] = el}
                onInput={evt => handleNextMove(evt, ind)}
                onKeyDown={evt => handlePreviousMove(evt, ind)}
                required
              />
            ))
          }
        </div>
        <button type="submit" className="otp-btn">Verify Email</button>
        <p className="otp-link-text">
          OTP Expired? <span className="otp-link" onClick={() => navigate('/signup/organizer')}>Back To Create Account</span>
        </p>
        <p className="otp-link-text">
          Entered Wrong Email? <span className="otp-link" onClick={() => navigate('/signup/organizer')}>Back To Create Account</span>
        </p>
      </form>
    </div>
  );
};

export default OTP;
