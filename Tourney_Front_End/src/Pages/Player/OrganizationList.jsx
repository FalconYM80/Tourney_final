import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from "@/components/Footer";

const OrganizationList = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [orgTournaments, setOrgTournaments] = useState({});
  const [tournamentLoading, setTournamentLoading] = useState(false);
  const [tournamentError, setTournamentError] = useState(null);
  const [otpModal, setOtpModal] = useState({ open: false, tournamentId: null, tournamentName: '', otp: '', feedback: '' });
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL.replace(/['\s]/g, '')}/api/player/organizations/public` : '/api/player/organizations/public';
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          setOrganizations(data.organizations);
        } else {
          setError(data.message || 'Failed to fetch organizations');
        }
      } catch (err) {
        setError('Error fetching organizations');
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  const handleOrgClick = async (orgId) => {
    if (expandedOrg === orgId) {
      setExpandedOrg(null);
      return;
    }
    setExpandedOrg(orgId);
    if (!orgTournaments[orgId]) {
      setTournamentLoading(true);
      setTournamentError(null);
      try {
        const url = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL.replace(/['\s]/g, '')}/api/player/organizations/${orgId}/tournaments` : `/api/player/organizations/${orgId}/tournaments`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          setOrgTournaments((prev) => ({ ...prev, [orgId]: data.tournaments }));
        } else {
          setTournamentError(data.message || 'Failed to fetch tournaments');
        }
      } catch (err) {
        setTournamentError('Error fetching tournaments');
      } finally {
        setTournamentLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col ">
      <Navigation />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto mt-24 px-6 pb-16">
          <div className="bg-white shadow-2xl rounded-3xl p-10 sm:p-12 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">Organizers</h2>
            <p className="text-gray-600 text-base sm:text-lg mb-10">
              Select an organizer to view and manage their tournaments
            </p>
            {loading && <div className="text-center mt-10">Loading organizations...</div>}
            {error && <div className="text-red-600 text-center mt-10">{error}</div>}
            {!loading && !organizations.length && <div className="text-center mt-10">No organizations found.</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center items-start">
              {organizations.map((org) => (
                <div
  key={org._id}
  onClick={() => handleOrgClick(org._id)}
  className={`w-full bg-gray-50 rounded-2xl shadow-md transition-all duration-300 ${
    expandedOrg === org._id ? 'bg-red-50' : ''
  } p-6 cursor-pointer hover:shadow-lg`}
>
  <div className="flex justify-between items-center">

                    <div>

                      <div>
                        <div className="text-xl font-semibold text-gray-800">{org.organizationName}</div>
                        {expandedOrg === org._id && (
                          <>
                            <div className="w-full h-px bg-red-300 mt-4 mb-4 transition-all duration-500 ease-in-out"></div>
                            <div className="mt-2 animate-fade-in-down">
                              {/* Tournaments List Here */}
                            </div>
                          </>
                        )}
                      </div>


                    </div>
                    <span className="text-gray-500 text-2xl">
                      {expandedOrg === org._id ? '▴' : '▾'}
                    </span>
                  </div>

                  {expandedOrg === org._id && (
                    <div className="mt-4">
                      {tournamentLoading ? (
                        <div className="text-sm">Loading tournaments...</div>
                      ) : tournamentError ? (
                        <div className="text-sm text-red-600">{tournamentError}</div>
                      ) : (
                        <ul className="mt-2 space-y-3">
                          {orgTournaments[org._id]?.length > 0 ? (
                            orgTournaments[org._id].map((tournament) => (
                              <li
                                key={tournament._id}
                                className="flex items-center space-x-2 text-red-600 hover:text-red-800 cursor-pointer px-3 py-2 rounded-md hover:bg-red-100 transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOtpModal({
                                    open: true,
                                    tournamentId: tournament._id,
                                    tournamentName: tournament.name,
                                    otp: tournament.settings?.otp || tournament.otp || '983620',
                                  });
                                }}
                              >
                                <span className="material-symbols-outlined text-base">emoji_events</span>
                                <span>{tournament.name}</span>
                              </li>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">No tournaments</div>
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {otpModal.open && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 relative">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() =>
                setOtpModal({
                  open: false,
                  tournamentId: null,
                  tournamentName: '',
                  otp: '',
                  feedback: '',
                })
              }
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-4 text-center">
              Verify OTP for <span className="text-red-600">{otpModal.tournamentName}</span>
            </h3>

            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="otpInput">
              OTP Code
            </label>
            <input
              id="otpInput"
              type="text"
              autoComplete='off'
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="Enter OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
            />

            {otpModal.feedback && (
              <div
                className={`text-sm text-center font-medium mb-3 ${otpModal.feedback.includes('verified') ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {otpModal.feedback}
              </div>
            )}

            <div className="flex justify-between space-x-4">
              <button
                className="w-1/2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                onClick={() =>
                  setOtpModal({
                    open: false,
                    tournamentId: null,
                    tournamentName: '',
                    otp: '',
                    feedback: '',
                  })
                }
              >
                Cancel
              </button>
              <button
                className="w-1/2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                onClick={() => {
                  if (otpInput === otpModal.otp) {
                    setOtpModal({ ...otpModal, feedback: 'OTP verified!' });
                    setTimeout(() => {
                      navigate(`/player/tournaments/${otpModal.tournamentId}/events`, {
                        state: orgTournaments[expandedOrg].find((t) => t._id === otpModal.tournamentId),
                      });
                      setOtpModal({ open: false, tournamentId: null, tournamentName: '', otp: '', feedback: '' });
                      setOtpInput('');
                    }, 800);
                  } else {
                    setOtpModal({ ...otpModal, feedback: 'Incorrect OTP!' });
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrganizationList;
