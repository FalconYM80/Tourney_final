import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const generateSecureOTP = async ()=>{
    try{
        const OTP = crypto.randomInt(100000,999999).toString(); // 6 Digit OTP
        const hashedOTP = await bcrypt.hash(OTP,10);
        const expiredAt = Date.now() + 5 * 60 * 1000; // we should store it in 'miliseconds'
        return {OTP,hashedOTP,expiredAt};
    }catch(error){
        console.log(`Error in Generating OTP ${error}`);
    }
}

export default generateSecureOTP;