import React, { useEffect, useState } from 'react';
import './CSS/Events.css';
import { IoAdd, IoSearchOutline, IoFilterOutline, IoEyeOutline, IoCreateOutline, IoTrashOutline, IoTrophyOutline, IoPeopleOutline, IoClose, IoHelpCircleOutline } from 'react-icons/io5';

import { useParams } from 'react-router-dom';

import { OrganizerContext } from '../../Contexts/OrganizerContext/OrganizerContext';
import { useContext } from 'react';


import { toast } from 'react-toastify';


const Events = () => {

  const { id } = useParams();
  // console.log(id);

  const { backend_URL } = useContext(OrganizerContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    eventName: '',
    eventType: 'singles',
    eventType2:'individual',
    matchType: 'knockout',
    maxTeams: '',
    teamEntryFee: '',
    allowBooking: true,
    offers: ''
  });

  // Mock events data
  const [events, setEvents] = useState();

  /**
   * [
    { id: 1, name: 'U9 BS', eventType: 'singles', fee: 'INR 599', matchType: 'knockout', maxTeam: '-', allowBooking: 'Active' },
    { id: 2, name: 'U9 GS', eventType: 'singles', fee: 'INR 599', matchType: 'knockout', maxTeam: '-', allowBooking: 'Active' },
    { id: 3, name: 'U11 BS', eventType: 'singles', fee: 'INR 599', matchType: 'knockout', maxTeam: '-', allowBooking: 'Inactive' },
    { id: 4, name: 'U11 GS', eventType: 'singles', fee: 'INR 599', matchType: 'knockout', maxTeam: '-', allowBooking: 'Active' },
    { id: 5, name: 'U13 BS', eventType: 'singles', fee: 'INR 595', matchType: 'knockout', maxTeam: '-', allowBooking: 'Active' },
    { id: 6, name: 'U13 GS', eventType: 'singles', fee: 'INR 599', matchType: 'knockout', maxTeam: '-', allowBooking: 'Active' },
    { id: 7, name: 'U15 BS', eventType: 'singles', fee: 'INR 599', matchType: 'knockout', maxTeam: '-', allowBooking: 'Active' },
    { id: 8, name: 'U15 GS', eventType: 'singles', fee: 'INR 599', matchType: 'knockout', maxTeam: '-', allowBooking: 'Active' },
    { id: 9, name: 'U17 BS', eventType: 'singles', fee: 'INR 599', matchType: 'knockout', maxTeam: '-', allowBooking: 'Active' },
    { id: 10, name: 'U17 GS', eventType: 'singles', fee: 'INR 599', matchType: 'knockout', maxTeam: '-', allowBooking: 'Active' },
  ]
   */

  // const filteredEvents = events?.filter(event => {
  //   const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                        event.eventType.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesFilter = filterStatus === 'all' || event.allowBooking.toLowerCase() === filterStatus;
  //   return matchesSearch && matchesFilter;
  // });

  const filteredEvents = events?.filter(event => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && event.allowBooking) ||
      (filterStatus === 'inactive' && !event.allowBooking);
    return matchesSearch && matchesFilter;
  });


  const handleCreateEvent = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewEventData({
      eventName: '',
      eventType: 'singles',
      eventType2:'individual',
      matchType: 'knockout',
      maxTeams: '',
      teamEntryFee: '',
      allowBooking: true,
      offers: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEventData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitEvent = async(e) => {
    e.preventDefault();
    
    try{

      const fetchOptions = {
        method:"POST",
        credentials:"include",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(newEventData)
      }

      const response = await fetch(`${backend_URL}/api/organizer/createEvent/${id}`,fetchOptions);
      const data = await response.json();
      if(data.success){
        toast.success(data.message);
        fetchAllEvents();
      }else{
        console.log(data);
        toast.error(data.message);
      }
    }catch(error){
        console.log("Error in Front-End Create Tournament Handler ", error);
        toast.error(error);
    } 



    handleCloseModal();

  };





  const fetchAllEvents = async (req,res)=>{

    try{
      const fetchOptions = {
        method:"GET",
        credentials:"include",
      }

      const response = await fetch(`${backend_URL}/api/organizer/allEvents/${id}`,fetchOptions);
      const data = await response.json();

      if(data.success){
        // toast.success(data.message);
        console.log(data.message);
        setEvents(data.message);
      }else{
        console.log(data);
        toast.error(data.message);
      }
    }catch(error){
        console.log("Error in Front-End Create Tournament Handler ", error);
        toast.error(error);
    } 

  }



  useEffect(()=>{ 
    fetchAllEvents();
  },[]);





  const handleViewEvent = (eventId) => {
    console.log('View event:', eventId);
  };

  const handleEditEvent = (eventId) => {
    console.log('Edit event:', eventId);
  };

  const handleDeleteEvent = (eventId) => {
    console.log('Delete event:', eventId);
  };

  const getStatusBadgeClass = (status) => {
    return status ? 'events-status-active' : 'events-status-inactive';
  };

  return (
    <div className="events-container">
      {/* Events Header */}
      <div className="events-header">
        <div className="events-title-section">
          <h2 className="events-main-title">Tournament Events</h2>
          <p className="events-subtitle">Manage all events for this tournament</p>
        </div>
        <button className="events-create-btn" onClick={handleCreateEvent}>
          <IoAdd className="events-create-icon" />
          Create New Event
        </button>
      </div>

      {/* Events Controls */}
      <div className="events-controls">
        <div className="events-search-wrapper">
          <IoSearchOutline className="events-search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="events-search-input"
          />
        </div>

        <div className="events-filters">
          <div className="events-filter-group">
            <IoFilterOutline className="events-filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="events-filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* <div className="events-filter-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="events-filter-select"
            >
              <option value="name">Sort by Name</option>
              <option value="fee">Sort by Fee</option>
              <option value="status">Sort by Status</option>
            </select>
          </div> */}

        </div>
      </div>

      {/* Events Table */}
      <div className="events-table-container">
        <div className="events-table-wrapper">
          <table className="events-table">
            <thead className="events-table-header">
              <tr>
                <th className="events-th events-th-sno">S.No</th>
                <th className="events-th events-th-name">Name</th>
                <th className="events-th events-th-type">Event Type</th>
                <th className="events-th events-th-fee">Fee</th>
                <th className="events-th events-th-match">Match Type</th>
                <th className="events-th events-th-team">Maximum Team</th>
                <th className="events-th events-th-booking">Allow Booking</th>
                {/* <th className="events-th events-th-actions">Actions</th> */}
              </tr> 
            </thead>
            <tbody className="events-table-body">
              {filteredEvents?.map((event, index) => (
                <tr key={event._id} className="events-table-row">
                  <td className="events-td events-td-sno">{index + 1}</td>
                  <td className="events-td events-td-name">
                    <div className="events-name-cell">
                      <IoTrophyOutline className="events-name-icon" />
                      <span className="events-name-text">{event.name}</span>
                    </div>
                  </td>
                  <td className="events-td events-td-type">
                    <span className="events-type-badge">{event.eventType}</span>
                  </td>
                  <td className="events-td events-td-fee">
                    <span className="events-fee-text">{event.entryFee}</span>
                  </td>
                  <td className="events-td events-td-match">{event.matchType}</td>
                  <td className="events-td events-td-team">{event.maxTeams}</td>
                  <td className="events-td events-td-booking">
                    <span className={`events-status-badge ${getStatusBadgeClass(event.allowBooking)}`}>
                      {event.allowBooking? 'Active' : 'In-Active'}
                    </span>
                  </td>
                  {/* <td className="events-td events-td-actions">
                    <div className="events-action-buttons">
                      <button 
                        className="events-action-btn events-view-btn"
                        onClick={() => handleViewEvent(event.id)}
                        title="View Event"
                      >
                        <IoEyeOutline />
                      </button>
                      <button 
                        className="events-action-btn events-edit-btn"
                        onClick={() => handleEditEvent(event.id)}
                        title="Edit Event"
                      >
                        <IoCreateOutline />
                      </button>
                      <button 
                        className="events-action-btn events-delete-btn"
                        onClick={() => handleDeleteEvent(event.id)}
                        title="Delete Event"
                      >
                        <IoTrashOutline />
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events Summary */}
      <div className="events-summary">
        <div className="events-summary-stats">
          <div className="events-stat-item">
            <span className="events-stat-label">Total Events:</span>
            <span className="events-stat-value">{events?.length}</span>
          </div>
          <div className="events-stat-item">
            <span className="events-stat-label">Active Events:</span>
            <span className="events-stat-value events-stat-active">
              {events?.filter(e => e.allowBooking).length}
            </span>
          </div>
          <div className="events-stat-item">
            <span className="events-stat-label">Inactive Events:</span>
            <span className="events-stat-value events-stat-inactive">
              {events?.filter(e => !e.allowBooking ).length}
            </span>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="events-modal-overlay" onClick={handleCloseModal}>
          <div className="events-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="events-modal-header">
              <div className="events-modal-title-section">
                <h2 className="events-modal-title">ADD NEW EVENT</h2>
                <p className="events-modal-subtitle">Create a new event for your tournament</p>
              </div>
              <button className="events-modal-close-btn" onClick={handleCloseModal}>
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="events-modal-form">
              {/* Event Name */}
              <div className="events-form-group">
                <label className="events-form-label">
                  EVENT NAME <span className="events-required">*</span>
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={newEventData.eventName}
                  onChange={handleInputChange}
                  placeholder="e.g. Men's singles"
                  className="events-form-input"
                  required
                />
              </div>

              {/* Event Type */}
              <div className="events-form-group">
                <label className="events-form-label">
                  EVENT TYPE <span className="events-required">*</span>
                </label>
                <div className="events-radio-group">
                  <label className="events-radio-option">
                    <input
                      type="radio"
                      name="eventType"
                      value="singles"
                      checked={newEventData.eventType === 'singles'}
                      onChange={handleInputChange}
                      className="events-radio-input"
                    />
                    <span className="events-radio-label">Singles</span>
                  </label>
                  <label className="events-radio-option">
                    <input
                      type="radio"
                      name="eventType"
                      value="doubles"
                      checked={newEventData.eventType === 'doubles'}
                      onChange={handleInputChange}
                      className="events-radio-input"
                    />
                    <span className="events-radio-label">Doubles</span>
                  </label>
                </div>
              </div>

              {/* Event Type 2 */}
              <div className="events-form-group">
                <label className="events-form-label">
                  EVENT TYPE <span className="events-required">*</span>
                </label>
                <div className="events-radio-group">
                  <label className="events-radio-option">
                    <input
                      type="radio"
                      name="eventType2"
                      value="individual"
                      checked={newEventData.eventType2 === 'individual'}
                      onChange={handleInputChange}
                      className="events-radio-input"
                    />
                    <span className="events-radio-label">Individual</span>
                  </label>
                  <label className="events-radio-option">
                    <input
                      type="radio"
                      name="eventType2"
                      value="group"
                      checked={newEventData.eventType2 === 'group'}
                      onChange={handleInputChange}
                      className="events-radio-input"
                    />
                    <span className="events-radio-label">Group</span>
                  </label>
                </div>
              </div>

              {/* Match Type */}
              <div className="events-form-group">
                <label className="events-form-label">
                  MATCH TYPE <span className="events-required">*</span>
                  <button type="button" className="events-help-btn" title="Fixture Calculator Helper">
                    <IoHelpCircleOutline />
                    <span className="events-help-text">FIXTURE CALCULATOR HELPER</span>
                  </button>
                </label>
                <div className="events-radio-group">
                  <label className="events-radio-option">
                    <input
                      type="radio"
                      name="matchType"
                      value="knockout"
                      checked={newEventData.matchType === 'knockout'}
                      onChange={handleInputChange}
                      className="events-radio-input"
                    />
                    <span className="events-radio-label">Knockout</span>
                  </label>
                  <label className="events-radio-option">
                    <input
                      type="radio"
                      name="matchType"
                      value="round-robin"
                      checked={newEventData.matchType === 'round-robin'}
                      onChange={handleInputChange}
                      className="events-radio-input"
                    />
                    <span className="events-radio-label">Round Robin</span>
                  </label>
                  <label className="events-radio-option">
                    <input
                      type="radio"
                      name="matchType"
                      value="round-robin-knockout"
                      checked={newEventData.matchType === 'round-robin-knockout'}
                      onChange={handleInputChange}
                      className="events-radio-input"
                    />
                    <span className="events-radio-label">Round Robin + Knockout</span>
                  </label>
                </div>
              </div>

              {/* Maximum Teams */}
              <div className="events-form-group">
                <label className="events-form-label">
                  MAXIMUM NUMBER OF TEAMS CAN PARTICIPATE
                  <button type="button" className="events-info-btn" title="Information">
                    <IoHelpCircleOutline />
                  </button>
                </label>
                <input
                  type="number"
                  name="maxTeams"
                  value={newEventData.maxTeams}
                  onChange={handleInputChange}
                  placeholder="e.g. 50"
                  className="events-form-input"
                />
              </div>

              {/* Team Entry Fee */}
              <div className="events-form-group">
                <label className="events-form-label">
                  TEAM ENTRY FEE
                  <button type="button" className="events-info-btn" title="Information">
                    <IoHelpCircleOutline />
                  </button>
                </label>
                <div className="events-fee-input-wrapper">
                  <span className="events-currency-prefix">INR</span>
                  <input
                    type="number"
                    name="teamEntryFee"
                    value={newEventData.teamEntryFee}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="events-form-input events-fee-input"
                  />
                </div>
              </div>

              {/* Allow Booking */}
              <div className="events-form-group">
                <label className="events-form-label">
                  ALLOW BOOKING
                  <button type="button" className="events-info-btn" title="Information">
                    <IoHelpCircleOutline />
                  </button>
                </label>
                <div className="events-toggle-wrapper">
                  <label className="events-toggle">
                    <input
                      type="checkbox"
                      name="allowBooking"
                      checked={newEventData.allowBooking}
                      onChange={handleInputChange}
                      className="events-toggle-input"
                    />
                    <span className="events-toggle-slider"></span>
                  </label>
                  <span className="events-toggle-label">
                    {newEventData.allowBooking ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Offers */}
              {/* <div className="events-form-group">
                <label className="events-form-label">OFFERS (IN %)</label>
                <div className="events-offers-input-wrapper">
                  <input
                    type="number"
                    name="offers"
                    value={newEventData.offers}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="events-form-input events-offers-input"
                    min="0"
                    max="100"
                  />
                  <span className="events-percentage-suffix">%</span>
                </div>
              </div> */}

              {/* Form Actions */}
              <div className="events-modal-actions">
                <button 
                  type="button" 
                  className="events-modal-btn events-modal-cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="events-modal-btn events-modal-save"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents?.length === 0 && (
        <div className="events-empty-state">
          <div className="events-empty-content">
            <IoTrophyOutline className="events-empty-icon" />
            <h3 className="events-empty-title">No events found</h3>
            <p className="events-empty-text">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first event to get started'
              }
            </p>
            <button className="events-empty-btn" onClick={handleCreateEvent}>
              <IoAdd className="events-empty-btn-icon" />
              Create First Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
