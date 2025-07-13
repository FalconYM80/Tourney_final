import React, { createContext, useState } from 'react';

export const AppContext = createContext();

import { toast } from 'react-toastify';


export const AppProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState('all');

  const backend_URL = import.meta.env.VITE_BACKEND_URL;

  const updateTournamentStatus = async ()=>{
    try {
      const fetchOptions = {
        method: "GET",
        credentials: "include"
      }

      const response = await fetch(`${backend_URL}/api/organizer/updateTournamentStatus`, fetchOptions);
      const data = await response.json();

      if (data.success) {
        console.log(data.message);
      } else {
        console.log(data.message);
        toast.error(data.message);
      }

    } catch (error) {
      console.log(`Error in updating tournament timings: ${error}`);
      toast.error(`Error in updating tournament timings: ${error}`);
    }
  }





  return (
    <AppContext.Provider value={{ selectedLocation, setSelectedLocation, backend_URL, updateTournamentStatus }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;