

// import playerRoutes from './Routes/Player/playerRoutes.js';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';






import { connectMongoDB } from './Config/Connection.js';



import bookingRoutes from './Routes/Player/bookingRoutes.js';

import OrganizerRoute from './Routes/Organizer/OrganizerRoute.js';

import PlayerRoute from './Routes/Player/PlayerRoute.js';


import adminRoutes from './Routes/Admin/AdminRoutes.js';

const app = express();
const PORT = process.env.PORT || 8000 ;


// const corsOptions = {
//     origin:[process.env.FRONT_END_URL],
//     methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
//     credentials:true,
// }


const corsOptions = {
  origin: [
    process.env.FRONT_END_URL || "http://localhost:5173", // Default Vite port
    "http://localhost:5174", // Your current frontend port
    "http://localhost:3000", // React default port
    "http://localhost:5000", // Alternative port
  ],
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS",
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
};


app.use(cors(corsOptions));


app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());





connectMongoDB(process.env.MONGODB_URI).then(()=>{
    console.log(`DataBase (MongoDB) Connected Successfully`);
}).catch((error)=>{
    console.log(`Error In DataBase Connection, ${error}`);
})






app.get("/",(req,res)=>{
    res.send(`<h1> Getting Started With BackEnd Of Tourny </h1>`)
})


app.use('/api/player/bookings', bookingRoutes);

app.use('/api/organizer/',OrganizerRoute);

app.use('/api/player',PlayerRoute);


app.use('/admin',adminRoutes);




app.listen(PORT,()=>{
    console.log(`Server Started At PORT ${PORT} :- http://localhost:${PORT}`);
})