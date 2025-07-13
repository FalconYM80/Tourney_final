import React, { useState, useEffect, useContext } from "react";
import "./CSS/OrganizerDashboard.css";
import { OrganizerContext } from "../../Contexts/OrganizerContext/OrganizerContext";

import {
  IoPersonCircleOutline,
  IoEllipsisVertical,
  IoCheckmarkCircle,
  IoClose,
  IoChevronForward,
  IoAdd,
  IoBusinessOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";

// SVG Icon Components (existing)
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const TrophyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V22h4v-7.34" />
    <path d="M12 9.5L14.5 2H9.5L12 9.5z" />
    <path d="M7 14h10" />
  </svg>
);
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
const ChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

// NEW: Icons for organization tabs
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
const SwitchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);
const BillingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const OrganizerDashboard = ({ toggleSidebar }) => {
  // NEW: State to manage the active organization tab
  const [activeOrgTab, setActiveOrgTab] = useState("My organization");

  // NEW: State for storing dashboard statistics
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const navigate = useNavigate();

  // NEW: Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/organizer/dashboard-stats",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();
        if (data.success) {
          setDashboardStats(data.stats);
        } else {
          console.error("Failed to fetch dashboard stats:", data.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // NEW: Data for the organization tabs
  const orgTabs = [
    { name: "My organization", icon: <HomeIcon /> },
    { name: "Members access", icon: <LockIcon /> },
    { name: "Switch organization", icon: <SwitchIcon /> },
    { name: "Billings", icon: <BillingsIcon /> },
  ];

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <button className="sidebar-toggle-open" onClick={toggleSidebar}>
          <MenuIcon />
        </button>
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your tournaments.</p>
        </div>
        <button
          className="create-tournament-btn"
          onClick={() => {
            navigate("/organizer/createTournament");
          }}
        >
          <PlusIcon /> Create New Tournament
        </button>
      </header>

      <section className="overview-cards">
        {statsLoading ? (
          <>
            <StatCard
              title="Total Tournaments"
              value="..."
              icon={<TrophyIcon />}
              iconClass="trophy"
            />
            <StatCard
              title="Active Tournaments"
              value="..."
              icon={<CalendarIcon />}
              iconClass="calendar"
            />
            <StatCard
              title="Total Participants"
              value="..."
              icon={<UsersIcon />}
              iconClass="users"
            />
            <StatCard
              title="Completed Tournaments"
              value="..."
              icon={<ChartIcon />}
              iconClass="chart"
            />
          </>
        ) : dashboardStats ? (
          <>
            <StatCard
              title="Total Tournaments"
              value={dashboardStats.totalTournaments}
              icon={<TrophyIcon />}
              iconClass="trophy"
            />
            <StatCard
              title="Active Tournaments"
              value={dashboardStats.activeTournaments}
              icon={<CalendarIcon />}
              iconClass="calendar"
            />
            <StatCard
              title="Total Participants"
              value={dashboardStats.totalParticipants}
              icon={<UsersIcon />}
              iconClass="users"
            />
            <StatCard
              title="Completed Tournaments"
              value={dashboardStats.completedTournaments}
              icon={<ChartIcon />}
              iconClass="chart"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Tournaments"
              value="0"
              icon={<TrophyIcon />}
              iconClass="trophy"
            />
            <StatCard
              title="Active Tournaments"
              value="0"
              icon={<CalendarIcon />}
              iconClass="calendar"
            />
            <StatCard
              title="Total Participants"
              value="0"
              icon={<UsersIcon />}
              iconClass="users"
            />
            <StatCard
              title="Completed Tournaments"
              value="0"
              icon={<ChartIcon />}
              iconClass="chart"
            />
          </>
        )}
      </section>

      <section className="organizations-section">
        {/* MODIFIED: Header updated with horizontal tabs */}
        <header className="organizations-header">
          <div className="organizations-title-group">
            <nav className="org-tabs">
              <ul>
                {orgTabs.map((tab) => (
                  <li key={tab.name}>
                    <button
                      className={activeOrgTab === tab.name ? "active" : ""}
                      onClick={() => setActiveOrgTab(tab.name)}
                    >
                      {tab.icon}
                      <span>{tab.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <div className="organizations-list">
          {activeOrgTab == "My organization" && <OrganizationHome />}
          {activeOrgTab == "Members access" && <MembersList />}
          {activeOrgTab == "Switch organization" && <SwitchOrganization />}
          {activeOrgTab == "Billings" && <Billings />}
        </div>
      </section>

      {/* Recent Tournaments Section
      {dashboardStats && dashboardStats.recentTournaments && dashboardStats.recentTournaments.length > 0 && (
        <section className="recent-tournaments-section">
          <header className="section-header">
            <h2>Recent Tournaments</h2>
            <button 
              className="view-all-btn" 
              onClick={() => navigate('/organizer/tournaments')}
            >
              View All
            </button>
          </header>
          
          <div className="tournaments-grid">
            {dashboardStats.recentTournaments.map((tournament) => (
              <div key={tournament._id} className="tournament-card">
                <div className="tournament-header">
                  <h3 className="tournament-name">{tournament.name}</h3>
                  <span className={`tournament-status status-${tournament.status}`}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </span>
                </div>
                
                <div className="tournament-details">
                  <div className="tournament-info">
                    <span className="tournament-label">Location:</span>
                    <span className="tournament-value">{tournament.location}</span>
                  </div>
                  
                  <div className="tournament-info">
                    <span className="tournament-label">Participants:</span>
                    <span className="tournament-value">{tournament.totalPlayers || 0}</span>
                  </div>
                  
                  <div className="tournament-info">
                    <span className="tournament-label">Start Date:</span>
                    <span className="tournament-value">
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="tournament-info">
                    <span className="tournament-label">End Date:</span>
                    <span className="tournament-value">
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="tournament-actions">
                  <button 
                    className="btn-view-tournament"
                    onClick={() => navigate(`/organizer/tournament/${tournament._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )} */}
    </main>
  );
};

const StatCard = ({ title, value, icon, iconClass }) => (
  <div className="stat-card">
    <div className="stat-info">
      <p className="title">{title}</p>
      <p className="value">{value}</p>
    </div>
    <div className={`stat-icon ${iconClass}`}>{icon}</div>
  </div>
);

const OrganizationHome = () => {
  const { organizerData, loading, isAuthenticated } =
    useContext(OrganizerContext);

  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    mobile: "",
    country: "IN",
  });

  // Local loading state while fetching organization info
  const [orgLoading, setOrgLoading] = useState(true);

  // Fetch current organization info on mount
  useEffect(() => {
    const fetchCurrentOrg = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/organizer/current-organization",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.success) {
          setFormData((prev) => ({
            ...prev,
            organizationName: data.organization.organizationName || "",
            email: data.organization.email || "",
            mobile: data.organization.phone || "",
            country: data.organization.country || "IN",
          }));
          setOrgLoading(false);
          return; // skip fallback below
        }
      } catch (e) {
        console.error("Error fetching current organization", e);
      }
      // fallback to organizer profile data
      if (organizerData) {
        setFormData({
          organizationName: organizerData.organizationName || "",
          email: organizerData.email || "",
          mobile: organizerData.phone || "",
          country: organizerData.country || "IN",
        });
        setOrgLoading(false);
      }
    };
    fetchCurrentOrg();
  }, [organizerData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Check if user has organization details
  const hasOrganizationDetails =
    formData.organizationName && formData.organizationName.trim() !== "";

  // If user doesn't have organization details, show empty state
  if (!loading && !orgLoading && !hasOrganizationDetails) {
    return (
      <div className="organization-form-container">
        <div className="form-header">
          <h2 className="greeting">HELLO, TOURNAMENT ORGANIZER</h2>
          <h1 className="form-title">NO ORGANIZATION DETAILS</h1>
        </div>
        <div className="empty-state">
          <p>You haven't set up your organization details yet.</p>
          <p>
            Use the "Create New Organization" option in the Switch Organization
            tab to add your organization details.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading || orgLoading) {
    return (
      <div className="organization-form-container">
        <div className="form-header">
          <h2 className="greeting">HELLO, TOURNAMENT ORGANIZER</h2>
          <h1 className="form-title">ORGANIZATION DETAILS</h1>
        </div>
        <div className="loading-state">
          <p>Loading organization details...</p>
        </div>
      </div>
    );
  }

  // Show error state if not authenticated
  if (!isAuthenticated && !loading) {
    return (
      <div className="organization-form-container">
        <div className="form-header">
          <h2 className="greeting">HELLO, TOURNAMENT ORGANIZER</h2>
          <h1 className="form-title">ORGANIZATION DETAILS</h1>
        </div>
        <div className="error-state">
          <p>Please login to view organization details</p>
          <button
            onClick={() => (window.location.href = "/login/organizer")}
            className="btn-primary"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="organization-form-container">
        <div className="form-header">
          <h2 className="greeting">HELLO, TOURNAMENT ORGANIZER</h2>
          <h1 className="form-title">ORGANIZATION DETAILS</h1>
        </div>

        <form className="organization-form">
          <div className="form-group">
            <label htmlFor="organizationName" className="form-label">
              ORGANIZATION NAME <span className="required">*</span>
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter organization name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              EMAIL <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile" className="form-label">
              MOBILE <span className="required">*</span>
              <span className="helper-text">(without country code)</span>
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter mobile number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="country" className="form-label">
              COUNTRY
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="IN">India (IN)</option>
              <option value="US">United States (US)</option>
              <option value="UK">United Kingdom (UK)</option>
              <option value="AU">Australia (AU)</option>
              <option value="CA">Canada (CA)</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Organization Details
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/organizer/members",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        setMembers(data.members);
      } else {
        console.error("Failed to fetch members:", data.message);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewMemberEmail("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !newMemberPassword.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/organizer/add-member",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: newMemberEmail.trim(),
            password: newMemberPassword.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Add the new member to the list
        const newMember = {
          _id: data.member._id,
          email: data.member.email,
          organizationName: data.member.organizationName,
          role: data.member.role,
          status: "Active",
          isDefault: false,
          addedAt: data.member.addedAt,
        };

        setMembers((prev) => [...prev, newMember]);
        handleCloseModal();
        setNewMemberPassword("");
        alert("Member added successfully!");
      } else {
        alert(data.message || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Error adding member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="members-list-container">
      <div className="members-header">
        <h2>Organization Members</h2>
        <button className="add-member-btn" onClick={handleAddMember}>
          + Add Member
        </button>
      </div>

      <div className="members-table">
        <div className="table-header">
          <div className="header-cell email-header">Email Address</div>
          <div className="header-cell role-header">Role</div>
          <div className="header-cell status-header">Status</div>
          <div className="header-cell actions-header">Actions</div>
        </div>

        <div className="table-body">
          {loading ? (
            <div className="loading-members">
              <p>Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="no-members">
              <p>No members found. Add your first member!</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member._id} className="member-row">
                <div className="member-email">
                  <IoPersonCircleOutline className="member-avatar" />
                  <div className="member-info">
                    <span className="email-text">{member.email}</span>
                    {member.organizationName ? (
                      <span className="organization-name">
                        Organization: {member.organizationName}
                      </span>
                    ) : (
                      <span className="organization-empty">
                        Organization: Not set
                      </span>
                    )}
                  </div>
                </div>

                <div className="member-role">
                  <span className={`role-badge ${member.role.toLowerCase()}`}>
                    {member.role.toUpperCase()}
                  </span>
                </div>

                <div className="member-status">
                  <span className="status-indicator">
                    <IoCheckmarkCircle className="status-icon active" />
                    {member.status}
                  </span>
                </div>

                <div className="member-actions">
                  {member.isDefault && (
                    <span className="default-badge">Default</span>
                  )}
                  <button className="action-menu-btn">
                    <IoEllipsisVertical />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Member</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="memberEmail" className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="memberEmail"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter member's email address"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="memberPassword" className="form-label">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="memberPassword"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter member's Password"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !newMemberEmail.trim()}
                >
                  {isSubmitting ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SwitchOrganization = () => {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationPhone, setOrganizationPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch accessible organizations on component mount
  useEffect(() => {
    fetchAccessibleOrganizations();
  }, []);

  const fetchAccessibleOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/organizer/accessible-organizations",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrganizations(data.organizations);
      } else {
        console.error("Failed to fetch organizations:", data.message);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchOrganization = async (orgId) => {
    if (switching) return;

    try {
      setSwitching(true);
      const response = await fetch(
        "http://localhost:8000/api/organizer/switch-organization",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            organizationId: orgId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update the active organization in state
        setOrganizations((prev) =>
          prev.map((org) => ({
            ...org,
            isActive: org._id === orgId,
          }))
        );

        setShowSwitcher(false);
        alert(`Successfully switched to ${data.organization.name}`);

        // Refresh the page to load new organization data
        window.location.reload();
      } else {
        alert(data.message || "Failed to switch organization");
      }
    } catch (error) {
      console.error("Error switching organization:", error);
      alert("Error switching organization. Please try again.");
    } finally {
      setSwitching(false);
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    if (!organizationName.trim()) return;

    setIsCreating(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/organizer/create-organization",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            organizationName: organizationName.trim(),
            organizationPhone: organizationPhone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Refresh the organization list to show the newly created organization
        await fetchAccessibleOrganizations();
        setShowCreateModal(false);
        setOrganizationName("");
        setOrganizationPhone("");
        alert("Organization created successfully!");

        // Refresh the page to update other components
        window.location.reload();
      } else {
        alert(data.message || "Failed to create organization");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("Error creating organization. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const currentOrg = organizations.find((org) => org.isActive);

  return (
    <div className="org-switcher-container">
      <button
        className="org-switcher-trigger"
        onClick={() => setShowSwitcher(!showSwitcher)}
      >
        <div className="org-switcher-current">
          <IoBusinessOutline className="org-switcher-icon" />
          <span className="org-switcher-name">{currentOrg?.name}</span>
        </div>
        <IoChevronForward
          className={`org-switcher-chevron ${
            showSwitcher ? "org-switcher-rotated" : ""
          }`}
        />
      </button>

      {showSwitcher && (
        <div className="org-switcher-dropdown">
          <div className="org-switcher-header">
            <h3>Switch Organization</h3>
          </div>

          <div className="org-switcher-list">
            {loading ? (
              <div className="loading-organizations">
                <p>Loading organizations...</p>
              </div>
            ) : organizations.length === 0 ? (
              <div className="no-organizations">
                <p>No organizations found.</p>
              </div>
            ) : (
              organizations.map((org) => (
                <div
                  key={org._id}
                  className={`org-switcher-item ${
                    org.isActive ? "org-switcher-active" : ""
                  }`}
                  onClick={() => handleSwitchOrganization(org._id)}
                >
                  <div className="org-switcher-details">
                    <div className="org-switcher-info">
                      <IoBusinessOutline className="org-switcher-avatar" />
                      <div className="org-switcher-text">
                        <span className="org-switcher-title">{org.name}</span>
                        <span className="org-switcher-role">{org.role}</span>
                      </div>
                    </div>

                    <div className="org-switcher-status">
                      {org.isActive && (
                        <IoCheckmarkCircle className="org-switcher-check" />
                      )}
                      <IoChevronForward className="org-switcher-arrow" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="org-switcher-actions">
            <button
              className="org-switcher-create"
              onClick={() => setShowCreateModal(true)}
            >
              <IoAdd className="org-switcher-plus" />
              Create New Organization
            </button>
          </div>
        </div>
      )}

      {showSwitcher && (
        <div
          className="org-switcher-overlay"
          onClick={() => setShowSwitcher(false)}
        />
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Organization</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleCreateOrganization} className="modal-form">
              <div className="form-group">
                <label htmlFor="organizationName" className="form-label">
                  Organization Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="form-input"
                  placeholder="Enter organization name"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="organizationPhone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="organizationPhone"
                  value={organizationPhone}
                  onChange={(e) => setOrganizationPhone(e.target.value)}
                  className="form-input"
                  placeholder="Enter organization phone number"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isCreating || !organizationName.trim()}
                >
                  {isCreating ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Billings = () => {
  return (
    <>
      <h1>Billings Will Appear Here</h1>
      <h2> Comming Soon... </h2>
    </>
  );
};

export default OrganizerDashboard;
