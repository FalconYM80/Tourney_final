import mongoose from 'mongoose';


const connectMongoDB = async (URI)=>{
    return await mongoose.connect(URI);
}

export { connectMongoDB };