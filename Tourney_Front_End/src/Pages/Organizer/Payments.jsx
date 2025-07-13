import React, { useState } from 'react';
import './CSS/Payments.css';
import { IoSearchOutline, IoFilterOutline, IoDownloadOutline, IoRefreshOutline, IoEyeOutline, IoCreateOutline, IoTrashOutline, IoCardOutline, IoWalletOutline, IoCheckmarkCircle, IoCloseCircle, IoTimeOutline } from 'react-icons/io5';

import { OrganizerContext } from '../../Contexts/OrganizerContext/OrganizerContext';
import { useContext } from 'react';
import { toast } from 'react-toastify';

import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import moment from 'moment';


const Payments = () => {


  const { backend_URL } = useContext(OrganizerContext);

  const { id } = useParams();


  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Mock payment data based on the uploaded images
  const [payments,setPayments] = useState([]);

  // const [paymentIndividual,setPaymentIndividual] = useState([]);
  // const [paymentGroup,setPaymentGroup] = useState([]);

  const [offlinePayment,setOfflinePayment] = useState(0);
  const [onlinePayment,setOnlinePayment] = useState(0);




  // Revenue data
  const revenueData = {
    online: {
      tickets: 95,
      amount: 58833
    },
    offline: {
      tickets: 21,
      amount: 11769
    }
  };

  const totalRevenue = revenueData.online.amount + revenueData.offline.amount;
  const totalTickets = revenueData.online.tickets + revenueData.offline.tickets;

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status.toLowerCase() === filterStatus;
    const matchesMode = filterMode === 'all' || payment.entry.toLowerCase() === filterMode;
    return matchesSearch && matchesStatus && matchesMode;
  });

  const handleExport = () => {
    console.log('Exporting payment data...');
  };

  const handleRefresh = () => {
    console.log('Refreshing payment data...');
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'payments-status-success';
      case 'pending':
        return 'payments-status-pending';
      case 'failed':
        return 'payments-status-failed';
      default:
        return 'payments-status-default';
    }
  };

  const getModeBadgeClass = (entry) => {
    return entry.toLowerCase() === 'online' ? 'payments-mode-online' : 'payments-mode-offline';
  };


  const fetchPayments = async () => {

    try{

      const fetchOptions = {
        method:"GET",
        credentials:"include",
      }

      const response = await fetch(`${backend_URL}/api/organizer/getPaymentDetails/${id}`,fetchOptions);
      const data = await response.json();

      if(data.success){
        console.log(data);
        let groupPayments = [];
        let individualPayments = [];
        const groupTeams = data.paymentsGroup;
        const individualTeam = data.paymentsIndividual;
        groupTeams.forEach((team) => {
          team.members.forEach((member)=>{
            groupPayments.push({
              id: team._id,
              event: team.event,
              team: member.name,
              email: member.email,
              academyName:member.academyName,
              date: moment(team.createdAt).format('Do MMM h:mm a'),
              amount: team.eventId.entryFee,
              status: "Success" ,
              entry: team.entry
            });
          })
        });

        individualTeam.forEach((player)=>{
          individualPayments.push({
            id:player._id,
            event:player.event,
            team:player.name,
            email:player.email,
            academyName:player.academyName,
            date:moment(player.createdAt).format('Do MMM h:mm a'),
            amount:player.eventId.entryFee,
            status:"Success",
            entry:player.entry,
          })   
        })

        console.log(groupPayments);
        console.log(individualPayments);

        setPayments([...groupPayments,...individualPayments]);

      }else{
        toast.error(`Error In Fetching Tournaments ${error}`);
      }


    }catch(error){
      console.log("Error in Fetching Tournaments Front-end",error);
      toast.error(`Error in Fetching Tournaments ${error}`);
    }
  
  }


  useEffect(()=>{ 
    fetchPayments();
    console.log(payments);
  },[]);


  useEffect(()=>{ 
    const onlinePayments = payments.filter(payment => payment.entry.toLowerCase() === 'online');
    const offlinePayments = payments.filter(payment => payment.entry.toLowerCase() === 'offline');

    setOnlinePayment(onlinePayments.reduce((total, payment) => total + payment.amount, 0));
    setOfflinePayment(offlinePayments.reduce((total, payment) => total + payment.amount, 0));
  },[payments]);

  console.log("Online Payments: ", onlinePayment);
  console.log("Offline Payments: ", offlinePayment);





  return (
    <div className="payments-container">
      {/* Payments Header */}
      <div className="payments-header">
        <div className="payments-title-section">
          <h2 className="payments-main-title">Tournament Payments</h2>
          <p className="payments-subtitle">Track revenue and manage payment transactions</p>
        </div>
        <div className="payments-header-actions">
          <button className="payments-action-btn payments-refresh-btn" onClick={handleRefresh}>
            <IoRefreshOutline className="payments-action-icon" />
            Refresh
          </button>
          <button className="payments-action-btn payments-export-btn" onClick={handleExport}>
            <IoDownloadOutline className="payments-action-icon" />
            Export
          </button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="payments-revenue-section">
        <h3 className="payments-revenue-title">REVENUE</h3>
        <div className="payments-revenue-grid">
          <div className="payments-revenue-card payments-revenue-online">
            <div className="payments-revenue-header">
              <span className="payments-revenue-badge payments-badge-online">ONLINE</span>
              <IoWalletOutline className="payments-revenue-icon" />
            </div>
            <div className="payments-revenue-content">
              <div className="payments-revenue-tickets">{revenueData.online.tickets} tickets</div>
              <div className="payments-revenue-amount">
                <span className="payments-currency">INR</span>
                <span className="payments-amount">{onlinePayment}</span>
              </div>
            </div>
          </div>

          <div className="payments-revenue-card payments-revenue-offline">
            <div className="payments-revenue-header">
              <span className="payments-revenue-badge payments-badge-offline">OFFLINE</span>
              <IoCardOutline className="payments-revenue-icon" />
            </div>
            <div className="payments-revenue-content">
              <div className="payments-revenue-tickets">{revenueData.offline.tickets} tickets</div>
              <div className="payments-revenue-amount">
                <span className="payments-currency">INR</span>
                <span className="payments-amount">{offlinePayment}</span>
              </div>
            </div>
          </div>

          <div className="payments-revenue-card payments-revenue-total">
            <div className="payments-revenue-header">
              <span className="payments-revenue-badge payments-badge-total">TOTAL</span>
              <IoWalletOutline className="payments-revenue-icon" />
            </div>
            <div className="payments-revenue-content">
              <div className="payments-revenue-tickets">{totalTickets} tickets</div>
              <div className="payments-revenue-amount">
                <span className="payments-currency">INR</span>
                <span className="payments-amount">{onlinePayment + offlinePayment}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Controls */}
      <div className="payments-controls">
        <div className="payments-search-wrapper">
          <IoSearchOutline className="payments-search-icon" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="payments-search-input"
          />
        </div>

        <div className="payments-filters">
          <div className="payments-filter-group">
            <IoFilterOutline className="payments-filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="payments-filter-select"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="payments-filter-group">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="payments-filter-select"
            >
              <option value="all">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="payments-filter-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="payments-filter-select"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead className="payments-table-header">
              <tr>
                <th className="payments-th payments-th-sno">S.No</th>
                <th className="payments-th payments-th-event">Event Name</th>
                <th className="payments-th payments-th-team">Team <span className='text-2xl'> / </span> Individual </th>
                <th className="payments-th payments-th-email">Email</th>
                { /* <th className="payments-th payments-th-payment-id">Payment Id</th> */ }
                <th className="payments-th payments-th-date">Date</th>
                <th className="payments-th payments-th-amount">Amount</th>
                <th className="payments-th payments-th-status">Payment Status</th>
                <th className="payments-th payments-th-mode">Mode</th>
                {/* <th className="payments-th payments-th-actions">Actions</th> */}
              </tr>
            </thead>
            <tbody className="payments-table-body">
              {filteredPayments.map((payment, index) => (
                <tr key={index+1} className="payments-table-row">
                  <td className="payments-td payments-td-sno">{index + 1}</td>
                  <td className="payments-td payments-td-event">
                    <span className="payments-event-text">{payment.event}</span>
                  </td>
                  <td className="payments-td payments-td-team">
                    <span className="payments-team-text">{payment.team}</span>
                  </td>
                  <td className="payments-td payments-td-email">
                    <span className="payments-email-text">{payment.email}</span>
                  </td>
                  {/* <td className="payments-td payments-td-payment-id">
                    <span className="payments-payment-id-text">
                      {payment.paymentId || '-'}
                    </span>
                  </td> */}
                  <td className="payments-td payments-td-date">
                    <span className="payments-date-text">{payment.date}
                      {/* moment(isoString).format('Do MMM h:mm a'); '2025-07-08T06:50:11.308Z' */}
                    </span>
                  </td>
                  <td className="payments-td payments-td-amount">
                    <span className="payments-amount-text">₹{payment.amount}</span>
                  </td>
                  <td className="payments-td payments-td-status">
                    <span className={`payments-status-badge ${getStatusBadgeClass(payment.status)}`}>
                      {payment.status === 'Success' && <IoCheckmarkCircle />}
                      {payment.status === 'Pending' && <IoTimeOutline />}
                      {payment.status === 'Failed' && <IoCloseCircle />}
                      {payment.status}
                    </span>
                  </td>
                  <td className="payments-td payments-td-mode">
                    <span className={`payments-mode-badge ${getModeBadgeClass(payment.entry)}`}>
                      {payment.entry}
                    </span>
                  </td>
                  {/* <td className="payments-td payments-td-actions">
                    <div className="payments-action-buttons">
                      <button 
                        className="payments-action-btn-small payments-view-btn"
                        title="View Payment"
                      >
                        <IoEyeOutline />
                      </button>
                      <button 
                        className="payments-action-btn-small payments-edit-btn"
                        title="Edit Payment"
                      >
                        <IoCreateOutline />
                      </button>
                      <button 
                        className="payments-action-btn-small payments-delete-btn"
                        title="Delete Payment"
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

      {/* Payments Summary */}
      <div className="payments-summary">
        <div className="payments-summary-stats">
          <div className="payments-stat-item">
            <span className="payments-stat-label">Total Payments:</span>
            <span className="payments-stat-value">{filteredPayments.length}</span>
          </div>
          <div className="payments-stat-item">
            <span className="payments-stat-label">Successful:</span>
            <span className="payments-stat-value payments-stat-success">
              {filteredPayments.filter(p => p.status === 'Success').length}
            </span>
          </div>
          <div className="payments-stat-item">
            <span className="payments-stat-label">Pending:</span>
            <span className="payments-stat-value payments-stat-pending">
              {filteredPayments.filter(p => p.status === 'Pending').length}
            </span>
          </div>
          <div className="payments-stat-item">
            <span className="payments-stat-label">Failed:</span>
            <span className="payments-stat-value payments-stat-failed">
              {filteredPayments.filter(p => p.status === 'Failed').length}
            </span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <div className="payments-empty-state">
          <div className="payments-empty-content">
            <IoWalletOutline className="payments-empty-icon" />
            <h3 className="payments-empty-title">No payments found</h3>
            <p className="payments-empty-text">
              {searchTerm || filterStatus !== 'all' || filterMode !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No payment transactions recorded yet'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
