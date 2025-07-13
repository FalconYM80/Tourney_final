import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
        required:true,
        unique:true,
    },
    DateOfBirth:{
        type:Date,
        required:true,
    },
    aadhaarImage:{
        type:String,
        required:true,
    },
    tournament:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'tournament',
        // required:true,
    },
    events:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'event',
        // required:true,
    },
    
    isAccountVerified:{
        type:Boolean,
        default:false,
    },
    verifyOtp:{
        type:String,
        default:"",
    },
    verifyOtpExpiredAt:{
        type:Number,
        default:0,
    },
    isVerifiedByAdmin:{
        type:Boolean,
        default:false,
    }
})

const PlayerModel = mongoose.model('player',PlayerSchema);


export default PlayerModel;
