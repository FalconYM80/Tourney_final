import React from "react";
import { useState, createContext } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

const OrganizerContext = createContext();

const OrganizerContextProvider = (props) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const backend_URL = import.meta.env.VITE_BACKEND_URL;

  const [isOrganizerLoggedIn, setIsOrganizerLoggedIn] = useState(false);
  const [organizerData, setOrganizerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [organizerMail, setOrganizerMail] = useState("");

  const [tournament, setTournament] = useState(null);

  const navigate = useNavigate();

  const [isSubmittingMail, setIsSubmittingMail] = useState(false);

  const getOrganizerData = async () => {
    try {
      setLoading(true);

      const fetchOptions = {
        method: "GET",
        credentials: "include",
      };

      const response = await fetch(
        `${backend_URL}/api/organizer/getOrganizerDetails`,
        fetchOptions
      );
      const data = await response.json();

      if (data.success) {
        // console.log(data);
        setOrganizerData(data.message);
        setIsAuthenticated(true);
      } else {
        console.log(data.message);
        // toast.error(data.message);
        setIsOrganizerLoggedIn(false);
        setIsAuthenticated(false);
        setOrganizerData(null);
      }
    } catch (error) {
      console.log(`Error In handling Get Organizer Data Fron-End ${error}`);
      setIsAuthenticated(false);
      setOrganizerData(null);
    } finally {
      setLoading(false);
    }
  };

  const getAuthStatusOrganizer = async (evt) => {
    try {
      const fetchOptions = {
        method: "GET",
        credentials: "include",
      };
      const response = await fetch(
        `${backend_URL}/api/organizer/checkAuth`,
        fetchOptions
      );
      const data = await response.json();
      if (data.success) {
        getOrganizerData();
        setIsOrganizerLoggedIn(true);
      } else {
        setIsOrganizerLoggedIn(false);
        // toast.error(data.message);
      }
    } catch (error) {
      console.log("Error In Front-End Getting Auth Status Organizer", error);
      toast.error(error);
    }
  };

  const fetchTournamentDetails = async (id) => {
    try {
      const fetchOptions = {
        method: "GET",
        credentials: "include",
      };

      const response = await fetch(
        `${backend_URL}/api/organizer/getParticularTournament/${id}`,
        fetchOptions
      );
      const data = await response.json();

      if (data.success) {
        console.log(data);
        setTournament(data.message);
      } else {
        toast.error(`Error In Fetching Tournaments ${data.message}`);
      }
    } catch (error) {
      console.log("Error in Fetching Tournament Details Front-end", error);
      toast.error(`Error in Fetching Tournament Details ${error}`);
    }
  };

  const value = {
    isSidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    backend_URL,
    isOrganizerLoggedIn,
    setIsOrganizerLoggedIn,
    organizerData,
    setOrganizerData,
    organizerMail,
    setOrganizerMail,
    getAuthStatusOrganizer,
    fetchTournamentDetails,
    tournament,
    isSubmittingMail,
    setIsSubmittingMail,
    loading,
    setLoading,
    isAuthenticated,
    setIsAuthenticated,
  };

  return (
    <OrganizerContext.Provider value={value}>
      {props.children}
    </OrganizerContext.Provider>
  );
};

export { OrganizerContext };

export default OrganizerContextProvider;
