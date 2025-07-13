import React, { useState, useEffect, useRef } from 'react';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { Search, AlertCircle } from 'lucide-react';

const MatchScoreSimple = ({
  teamA = 'Team A',
  teamB = 'Team B',
  scoreA = 0,
  scoreB = 0,
  status = 'COMPLETED',
}) => {
  return (
    <div className="max-w-3xl mx-auto mt-12 rounded-3xl shadow-2xl bg-white">
      <div className="relative bg-white rounded-[2.5rem] overflow-hidden py-10 px-8 md:px-16 flex flex-col gap-6">
        {/* Status badge */}
        <div className="absolute top-6 right-8">
          {/* <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm ${status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{status}</span> */}
        </div>
        <div className="flex flex-row items-center justify-between gap-8">
          {/* Team A */}
          <div className="flex-1 text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold text-rose-600 drop-shadow-lg uppercase">{teamA}</h2>
          </div>
          {/* Score */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 mb-2 tracking-widest">SCORE</span>
            <div className="bg-gradient-to-b from-red-500 to-rose-600 text-white text-4xl md:text-5xl font-extrabold rounded-2xl px-6 py-4 flex flex-row items-center justify-center gap-4">
            <span>{scoreA}</span>
              <span className="text-3xl md:text-4xl font-extrabold mx-1">-</span>
              <span>{scoreB}</span>
            </div>
          </div>
          {/* Team B */}
          <div className="flex-1 text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold text-blue-600 drop-shadow-lg uppercase">{teamB}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScoreTournament = () => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const intervalRef = useRef(null);

  const fetchFixture = async (teamAVal, teamBVal) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/player/fixtures/search?teamA=${encodeURIComponent(teamAVal)}&teamB=${encodeURIComponent(teamBVal)}`
      );
      if (!response.ok) throw new Error('No match found');
      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    await fetchFixture(teamA, teamB);
    setLoading(false);
  };

  useEffect(() => {
    if (result?.success && teamA && teamB) {
      intervalRef.current = setInterval(() => {
        fetchFixture(teamA, teamB);
      }, 10000);
      return () => clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [result?.success, teamA, teamB]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-8 text-center">Search Fixture by Team</h1>

        {/* Search Form */}
        <form
          onSubmit={handleFetch}
          className="flex flex-col gap-4 w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-200"
        >
          <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full focus:outline-none placeholder-gray-400"
              placeholder="Enter Team A"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full focus:outline-none placeholder-gray-400"
              placeholder="Enter Team B"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-200 text-white font-semibold py-3 rounded-full shadow-md flex justify-center items-center gap-2"
          >
            <span className="text-md font-medium">
              {loading ? 'Searching...' : 'Find Match'}
            </span>
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-600 flex items-center gap-2 animate-pulse">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Match Result Display */}
        {result?.success && result?.fixture && (
          <MatchScoreSimple
            teamA={result.teamAName}
            teamB={result.teamBName}
            scoreA={result.fixture.scoreA}
            scoreB={result.fixture.scoreB}
            status=""
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default ScoreTournament;
