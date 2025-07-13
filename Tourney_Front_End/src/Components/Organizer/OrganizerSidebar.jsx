import React from 'react';
import './CSS/OrganizerSidebar.css';

import { Link,NavLink, useNavigate } from 'react-router-dom';


import { FaArrowLeft } from "react-icons/fa6";


import { OrganizerContext } from '../../Contexts/OrganizerContext/OrganizerContext';

import { useContext } from 'react';




import { toast } from 'react-toastify';








// SVG Icon Components
const GridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V22h4v-7.34"/><path d="M12 9.5L14.5 2H9.5L12 9.5z"/><path d="M7 14h10"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const OrganizerIcon = () => <div style={{width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 'bold', fontSize: '14px'}}>O</div>;


const OrganizerSidebar = ({ isOpen, toggleSidebar }) => {


  const navigate = useNavigate();



  const { isOrganizerLoggedIn, backend_URL, setOrganizerData, setIsOrganizerLoggedIn, getAuthStatusOrganizer } = useContext(OrganizerContext);




    const handleLogOut = async(evt)=>{
      try{
            const fetchOptions = {
              method:"POST",
              credentials:"include",
            }
  
            const response = await fetch(`${backend_URL}/api/organizer/logout`,fetchOptions);
            const data = await response.json();
  
            if(data.success){
              toast.success(data.message);
              setIsOrganizerLoggedIn(false);
              setOrganizerData(false);
              getAuthStatusOrganizer();
              navigate('/');
              // console.log("Organizer Logged Out Successfully");
            }else{
              console.log("Error In LogOut Route Frontend",data.message);
              toast.error(data.message);
            }
  
          }catch(error){
            console.log("Error In LogOut Route Frontend",error);
            toast.error(`Error In LogOut Route ${error}`);
          }
    }





  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div>
        <div className="sidebar-header">
          <h2><OrganizerIcon /> Organizer Panel</h2>
          {/* <span className="icon icon-toggle"><ChevronLeftIcon /></span> */}
          <button onClick={toggleSidebar} className="sidebar-toggle-close">&times;</button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="nav-item">
              <NavLink to='/organizer/home'>
                <span className="icon"><GridIcon /></span>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to='/organizer/tournaments'>
                <span className="icon"><TrophyIcon /></span>
                My Tournaments
              </NavLink>
            </li>
            <li className="nav-item">
              <Link to='/organizer/createTournament'>
                <span className="icon"><PlusIcon /></span>
                Create Tournament
              </Link>
            </li>
            {/* <li className="nav-item">
              <a href="#">
                <span className="icon"><SettingsIcon /></span>
                Settings
              </a>
            </li> */}
          </ul>
        </nav>
      </div>
      <div className="user-profile cursor-pointer" onClick={()=>{ handleLogOut() }}>
        <div className="avatar">
          <FaArrowLeft />
        </div>
        <div className="user-info" >
          <p className="name">Log Out</p>
          {/* <p className="email">john@example.com</p> */}
        </div>
      </div>
    </aside>
  );
};

export default OrganizerSidebar;
