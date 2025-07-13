import React from 'react'
import { useState, createContext } from 'react';

import { useNavigate } from'react-router-dom';

import { toast } from 'react-toastify';

const PlayerContext = createContext();







const PlayerContextProvider = (props)=>{
    

    const backend_URL = import.meta.env.VITE_BACKEND_URL;

    const [isPlayerLoggedIn,setIsPlayerLoggedIn] = useState(false);
    const [playerData,setPlayerData] = useState(null);

    const [playerMail,setPlayerMail] = useState("");


    const navigate = useNavigate();




    
    const getPlayerData = async ()=>{

        try{

            const fetchOptions = {
                method:"GET",
                credentials:"include"
            }

            const response = await fetch(`${backend_URL}/api/player/getPlayerDetails`,fetchOptions);
            const data = await response.json();

            if(data.success){
                console.log(data);
                setPlayerData(data.message);
            }else{
                console.log(data.message);
                // toast.error(data.message);
                setIsPlayerLoggedIn(false);
            }


        }catch(error){
            console.log(`Error In handling Get Player Data Fron-End ${error}`);
        }

    }




    const getAuthStatusPlayer = async(evt)=>{
        try{
            const fetchOptions = {
                method:"GET",
                credentials:"include",
            }
            const response = await fetch(`${backend_URL}/api/player/checkAuth`,fetchOptions);
            const data = await response.json();
            if(data.success){
                getPlayerData();
                setIsPlayerLoggedIn(true);
            }else{
                setIsPlayerLoggedIn(false);
                // toast.error(data.message);
            }


        }catch(error){
            console.log("Error In Front-End Getting Auth Status Player", error);
            toast.error(error);
        }
    }



    


    
    const value = {
        backend_URL,
        isPlayerLoggedIn,setIsPlayerLoggedIn,
        playerData,setPlayerData,
        playerMail,setPlayerMail,
        getAuthStatusPlayer, 
    };
    
    
    return (
        <PlayerContext.Provider value={value}>
            {props.children}
        </PlayerContext.Provider>
    )
    
    
    
}


export { PlayerContext };

export default PlayerContextProvider