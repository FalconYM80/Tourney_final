import React, { useState, useEffect, useContext } from 'react';
import './CSS/Scores.css';
import { IoClose, IoSaveOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { OrganizerContext } from '../../Contexts/OrganizerContext/OrganizerContext';
import { useParams } from 'react-router-dom';

const Scores = () => {
  const { backend_URL } = useContext(OrganizerContext);
  const { id } = useParams();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [fixtures, setFixtures] = useState([]);
  const [showLiveScoringModal, setShowLiveScoringModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loadingFixtures, setLoadingFixtures] = useState(false);

  // Fetch all events
  useEffect(() => {
    const fetchAllMatches = async () => {
      try {
        const fetchOptions = { method: "GET", credentials: "include" };
        const response = await fetch(`${backend_URL}/api/organizer/allEvents/${id}`, fetchOptions);
        const data = await response.json();
        if (data.success) {
          setEvents(data.message);
          setSelectedEvent(data.message.length > 0 ? data.message[0].name : "");
          setSelectedEventId(data.message.length > 0 ? data.message[0]._id : "");
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.toString());
      }
    };
    fetchAllMatches();
    // eslint-disable-next-line
  }, []);

  // Fetch all matches for selected event
  const fetchFixtures = async (eventId = selectedEventId) => {
    if (!eventId) return;
    setLoadingFixtures(true);
    try {
      const fetchOptions = { method: "GET", credentials: "include" };
      const response = await fetch(`${backend_URL}/api/organizer/allMatches/${id}/${eventId}`, fetchOptions);
      const data = await response.json();
      if (data.success) {
        setFixtures(data.fixtures);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.toString());
    }
    setLoadingFixtures(false);
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchFixtures(selectedEventId);
    }
    // eslint-disable-next-line
  }, [selectedEventId]);

  const filteredFixtures = fixtures.filter(match => match.event === selectedEventId);

  const handleStartLiveScoring = (match) => {
    setSelectedMatch(match);
    setShowLiveScoringModal(true);
  };

  const handleCloseLiveScoring = () => {
    setShowLiveScoringModal(false);
    setSelectedMatch(null);
  };

  // After update/reset, refetch fixtures to get fresh data with names
  const handleScoresChanged = async () => {
    await fetchFixtures();
    handleCloseLiveScoring();
  };

  return (
    <div className="scores-container">
      <div className="scores-header">
        <div className="scores-title-section">
          <h2 className="scores-main-title">Live Scoring</h2>
          <p className="scores-subtitle">Real-time match scoring and management</p>
        </div>
      </div>

      <div className="scores-controls">
        <div className="scores-filters">
          <div className="scores-filter-group">
            <select
              value={selectedEvent}
              onChange={e => {
                setSelectedEvent(e.target.value);
                setSelectedEventId(events.find(ev => ev.name === e.target.value)?._id);
              }}
              className="scores-filter-select"
            >
              {events.map(event => (
                <option key={event._id} value={event.name}>{event.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="scores-matches-container">
        <h3 className="scores-matches-title">Matches</h3>
        <div className="scores-matches-list">
          {loadingFixtures ? (
            <div className="scores-no-matches">Loading matches...</div>
          ) : filteredFixtures.length === 0 ? (
            <div className="scores-no-matches">No matches available for this event.</div>
          ) : (
            filteredFixtures.map(match => (
              <div key={match._id} className="scores-match-card">
                <div className="scores-match-players">
                  <span className="scores-player-name">{match.teamA?.teamName}</span>
                  <span className="scores-vs">vs</span>
                  <span className="scores-player-name">{match.teamB?.teamName}</span>
                </div>
                <div className="scores-match-score">
                  <span className="scores-current-score">
                    Score: {match.scoreA} - {match.scoreB}
                  </span>
                </div>
                <div className="scores-match-actions">
                  <button
                    className="scores-live-scoring-btn"
                    onClick={() => handleStartLiveScoring(match)}
                  >
                    Start Live Scoring
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showLiveScoringModal && selectedMatch && (
        <LiveScoringModal
          match={selectedMatch}
          onClose={handleCloseLiveScoring}
          onScoresChanged={handleScoresChanged}
          backend_URL={backend_URL}
        />
      )}
    </div>
  );
};

// Live Scoring Modal Component (matches backend data)
const LiveScoringModal = ({ match, onClose, onScoresChanged, backend_URL }) => {
  const [scoreA, setScoreA] = useState(match.scoreA || 0);
  const [scoreB, setScoreB] = useState(match.scoreB || 0);
  const [loading, setLoading] = useState(false);

  // Save/submit scores (call backend)
  const handleScoreSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${backend_URL}/api/organizer/update-scores/${match._id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scoreA, scoreB }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success('Scores updated!');
        await onScoresChanged();
      } else {
        toast.error(data.message || 'Failed to update scores');
      }
    } catch (err) {
      toast.error('Error updating scores');
    }
    setLoading(false);
  };

  // Reset both scores to zero (call backend)
  const handleResetScores = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${backend_URL}/api/organizer/reset-scores/${match._id}`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      );
      const data = await response.json();
      if (data.success) {
        setScoreA(0);
        setScoreB(0);
        toast.success('Scores reset!');
        await onScoresChanged();
      } else {
        toast.error(data.message || 'Failed to reset scores');
      }
    } catch (err) {
      toast.error('Error resetting scores');
    }
    setLoading(false);
  };

  return (
    <div className="live-scoring-overlay" onClick={onClose}>
      <div className="live-scoring-container" onClick={e => e.stopPropagation()}>
        <div className="live-scoring-header">
          <div className="live-scoring-title-section">
            <h2 className="live-scoring-title">Live Scoring</h2>
            <p className="live-scoring-subtitle">
              Event: {match.event}
            </p>
          </div>
          <button className="live-scoring-close-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="live-scoring-content">
          <div className="live-scoring-match-title">
            <h3>
              {match.teamA?.teamName} <span style={{ color: '#64748b', fontWeight: 400 }}>vs</span> {match.teamB?.teamName}
            </h3>
          </div>
          <div className="live-scoring-display">
            {/* Team A */}
            <div className="live-scoring-player">
              <div className="live-scoring-player-name">{match.teamA?.teamName}</div>
              <div className="live-scoring-score player1-score">{scoreA}</div>
              <div className="live-scoring-controls">
                <button className="live-scoring-btn minus-btn" disabled={loading} onClick={() => setScoreA(s => Math.max(0, s - 1))}>-</button>
                <button className="live-scoring-btn plus-btn player1-plus" disabled={loading} onClick={() => setScoreA(s => s + 1)}>+</button>
              </div>
            </div>
            {/* Team B */}
            <div className="live-scoring-player">
              <div className="live-scoring-player-name">{match.teamB?.teamName}</div>
              <div className="live-scoring-score player2-score">{scoreB}</div>
              <div className="live-scoring-controls">
                <button className="live-scoring-btn minus-btn" disabled={loading} onClick={() => setScoreB(s => Math.max(0, s - 1))}>-</button>
                <button className="live-scoring-btn plus-btn player2-plus" disabled={loading} onClick={() => setScoreB(s => s + 1)}>+</button>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="live-scoring-actions">
            <button className="live-scoring-action-btn reset-btn" onClick={handleResetScores} disabled={loading}>
              Reset All Scores
            </button>
            <button className="live-scoring-action-btn save-btn" onClick={handleScoreSubmit} disabled={loading}>
              <IoSaveOutline /> Save Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scores;
