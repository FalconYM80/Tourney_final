import React from 'react';

import './CSS/OrganizerTournament.css';

import OrganizerSidebar from '../../Components/Organizer/OrganizerSidebar';

import { IoAdd, IoSearchOutline, IoEyeOutline, IoCreateOutline, IoTrashOutline, IoCalendarOutline, IoLocationOutline, IoPeopleOutline, IoMenuOutline } from 'react-icons/io5';

import { IoLocation } from "react-icons/io5";


import {OrganizerContext} from '../../Contexts/OrganizerContext/OrganizerContext';

import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';



const OrganizerTournament = () => {

  const navigate = useNavigate();
  
  const { isSidebarOpen, setSidebarOpen, toggleSidebar, backend_URL, isOrganizerLoggedIn } = useContext(OrganizerContext);


    // useEffect(()=>{
    //   if (!isOrganizerLoggedIn) {
    //     navigate('/');
    //   }
    //  },[isOrganizerLoggedIn]);


  

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [loading,setLoading] = useState(false);
  

  const menu = useRef(null);
  useEffect(()=>{ 
    if(isSidebarOpen){
      if(menu && menu.current && menu.current.style){
        menu.current.style.left = '200px';
      }
    }else{
      if(menu && menu.current && menu.current.style){
        menu.current.style.left = '20px';
      }
    }
  },[isSidebarOpen]);

  const [tournaments,setTournaments] = useState([]);

  /**[
    {
      _id: 1,
      name: 'Summer Badminton Championship 2024',
      sport: 'Badminton',
      status: 'Active',
      dates: '7/15/2024 - 7/20/2024',
      location: 'Sports Complex, Mumbai',
      participants: '64/128 participants',
      events: '8 events'
    },
    {
      _id: 2,
      name: 'Inter-College Football Tournament',
      sport: 'Football',
      status: 'Upcoming',
      dates: '8/10/2024 - 8/15/2024',
      location: 'University Ground, Delhi',
      participants: '32/64 participants',
      events: '4 events'
    },
    {
      _id: 3,
      name: 'City Tennis Open',
      sport: 'Tennis',
      status: 'Completed',
      dates: '6/1/2024 - 6/5/2024',
      location: 'Tennis Club, Bangalore',
      participants: '48/48 participants',
      events: '6 events'
    }
  ] */



  

  const handleView = (tournamentId) => {
    // console.log('View tournament:', tournamentId);
    navigate(`/organizer/tournament/${tournamentId}`);
  };

  const handleEdit = (tournamentId) => {
    console.log('Edit tournament:', tournamentId);
  };

  const handleDelete = (tournamentId) => {
    console.log('Delete tournament:', tournamentId);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'organizer-tournament-status-active';
      case 'Upcoming':
        return 'organizer-tournament-status-upcoming';
      case 'Completed':
        return 'organizer-tournament-status-completed';
      default:
        return 'organizer-tournament-status-default';
    }
  };


  const fetchAllTournaments = async()=>{
    try{

      const fetchOptions = {
        method:"GET",
        credentials:"include",
      }

      const response = await fetch(`${backend_URL}/api/organizer/getAllTournaments`,fetchOptions);
      const data = await response.json();

      if(data.success){
        console.log(data);
        setTournaments(data.message);

      }else{
        toast.error(`Error In Fetching Tournaments ${error}`);
      }


    }catch(error){
      console.log("Error in Fetching Tournaments Front-end",error);
      toast.error(`Error in Fetching Tournaments ${error}`);
    }
  }



  useEffect(()=>{ 
    fetchAllTournaments();
  },[]);




    const filterOptions = ['All', 'Active', 'Upcoming', 'Completed'];

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || tournament.status === activeFilter;
    return matchesSearch && matchesFilter;
  });








  if(loading){
    return <h1 className='text-9xl text-green-700 h-48 align-center pl-80'> Loading.... </h1>
  }

  return (
    <div className="organizer-tournament-layout">
      {/* Sidebar */}
      <div className={`organizer-tournament-sidebar ${isSidebarOpen ? 'organizer-tournament-sidebar-open' : 'organizer-tournament-sidebar-closed'}`}>
        <OrganizerSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
      </div>

      {/* Main Content */}
      <div className={`organizer-tournament-main ${isSidebarOpen ? 'organizer-tournament-main-with-sidebar' : 'organizer-tournament-main-full'}`}>
        {/* Toggle Button */}
        <button 
          className="organizer-tournament-toggle-btn"
          onClick={toggleSidebar}
          ref={menu}
        >
          <IoMenuOutline className="organizer-tournament-toggle-icon" />
        </button>

        <div className="organizer-tournament-container">
          <div className="organizer-tournament-header">
            <div className="organizer-tournament-title-section">
              <h1 className="organizer-tournament-main-title">My Tournaments</h1>
              <p className="organizer-tournament-subtitle">Manage all your tournaments and events</p>
            </div>
            <button className="organizer-tournament-create-btn" onClick={()=>{ navigate('/organizer/createTournament'); }}>
              <IoAdd className="organizer-tournament-create-icon" />
              Create New Tournament
            </button>
          </div>

          <div className="organizer-tournament-controls">
            <div className="organizer-tournament-search-wrapper">
              <IoSearchOutline className="organizer-tournament-search-icon" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="organizer-tournament-search-input"
              />
            </div>

            <div className="organizer-tournament-filter-tabs">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  className={`organizer-tournament-filter-tab ${activeFilter === filter ? 'organizer-tournament-filter-active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="organizer-tournament-grid">
            {filteredTournaments.map((tournament) => (

             <div key={tournament._id} className="organizer-tournament-card">
  <div className="organizer-tournament-card-image-wrapper">
    <img
      className="organizer-tournament-card-image"
      src={tournament.coverImage || '/default-tournament.jpg'}
      alt={tournament.name}
      onError={e => { e.target.src = '/default-tournament.jpg'; }}
    />
  </div>
  <div className="organizer-tournament-card-header">
    <div className="organizer-tournament-card-title-section">
      <h3 className="organizer-tournament-card-title">{tournament.name}</h3>
      <div className="organizer-tournament-card-badges">
        <span className="organizer-tournament-sport-badge">{tournament.sport}</span>
        <span className={`organizer-tournament-status-badge ${getStatusBadgeClass(tournament.status)}`}>
          {tournament.status}
        </span>
      </div>
    </div>
  </div>
  <div className="organizer-tournament-card-details">
    <div className="organizer-tournament-detail-item">
      <IoCalendarOutline className="organizer-tournament-detail-icon" />
      <span className="organizer-tournament-detail-text">
        {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
      </span>
    </div>
    <div className="organizer-tournament-detail-item">
      <span className="organizer-tournament-detail-text">{tournament.location}</span>
    </div>
  </div>
  <div className="organizer-tournament-card-actions">
    <button 
      className="organizer-tournament-action-btn organizer-tournament-view-btn"
      onClick={() => handleView(tournament._id)}
    >
      <IoEyeOutline className="organizer-tournament-action-icon" />
      View
    </button>
    <button 
      className="organizer-tournament-action-btn organizer-tournament-delete-btn"
      onClick={() => handleDelete(tournament._id)}
    >
      <IoTrashOutline className="organizer-tournament-action-icon" />
      Delete
    </button>
  </div>
</div>


            ))}
          </div>

          {filteredTournaments.length === 0 && (
            <div className="organizer-tournament-empty-state">
              <div className="organizer-tournament-empty-content">
                <h3 className="organizer-tournament-empty-title">No tournaments found</h3>
                <p className="organizer-tournament-empty-text">
                  {searchTerm || activeFilter !== 'All' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first tournament to get started'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile
      {isSidebarOpen && (
        <div 
          className="organizer-tournament-overlay"
          onClick={toggleSidebar}
        />
      )} */}
    </div>
  );
};

export default OrganizerTournament;
