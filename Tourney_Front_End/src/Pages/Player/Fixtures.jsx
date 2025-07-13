import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '@/Components/Navigation';
import Footer from '@/Components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, User } from "lucide-react";
import { fetchFixtures } from "@/lib/api";
// Import fetchEvents and fetchStandings
import { fetchEvents, fetchStandings } from "@/lib/api";

const Fixtures = () => {
  const location = useLocation();
  const eventName = location.state?.eventName || "Tournament";
  const tournamentId = location.state?.tournamentId;
  const eventId = location.state?.eventId;

  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStandings, setShowStandings] = useState(false);
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    const loadFixtures = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!tournamentId) throw new Error("Tournament ID not provided");
        // Fetch both fixtures and teams first, so teamMap is available for both fixtures and standings
        const [fixturesData, teams] = await Promise.all([
          fetchFixtures(tournamentId, eventId),
          (await import('@/lib/api')).fetchTeams(tournamentId, eventId)
        ]);
        // Build a map of teamId -> name
        const teamMap = {};
        teams?.forEach(team => {
          teamMap[team._id] = team.name || team.teamName || team._id;
        });
        // Fetch event info to check matchType and standings
        let matchType = null;
        try {
          const events = await fetchEvents(tournamentId);
          const event = events.find(ev => ev._id === eventId);
          matchType = event?.matchType;
          if (matchType === 'round-robin') {
            setShowStandings(true);
            // Fetch standings
            const standingsData = await fetchStandings(tournamentId, eventId);
            // Attach team names to standings rows
            const standingsWithNames = (standingsData || []).map(row => ({
              ...row,
              teamName: teamMap[row.teamId] || row.teamName || row.team || row.teamId
            }));
            setStandings(standingsWithNames);
          } else {
            setShowStandings(false);
            setStandings([]);
          }
        } catch (e) {
          setShowStandings(false);
          setStandings([]);
        }
        // Group by round (assuming backend returns flat fixture array)
        const grouped = {};
        fixturesData.forEach(fx => {
          const round = fx.roundName || `Round ${fx.round ?? 1}`;
          if (!grouped[round]) grouped[round] = [];
          grouped[round].push(fx);
        });
        // Convert to array for rendering
        const rounds = Object.entries(grouped).map(([round, matches], i) => ({
          id: i + 1,
          round,
          matches: matches.map(m => ({
            id: m._id,
            team1: teamMap[m.teamA] || m.teamAName || m.teamA || "TBD",
            team2: teamMap[m.teamB] || m.teamBName || m.teamB || "TBD",
            time: m.time || "",
            date: m.date ? m.date.split('T')[0] : "",
            ...m
          }))
        }));
        setFixtures(rounds);
      } catch (err) {
        setError(err.message || "Failed to load fixtures");
      } finally {
        setLoading(false);
      }
    };
    loadFixtures();
    // eslint-disable-next-line
  }, [tournamentId, eventId]);

  // Display each match in a round
  const MatchComponent = ({ match }) => {
    // Determine winner's name if exists
    let winnerName = null;
    if (match.winner) {
      // winner can be teamA/teamB id or name
      if (match.winner === match.teamA || match.winner === match.team1) {
        winnerName = match.team1;
      } else if (match.winner === match.teamB || match.winner === match.team2) {
        winnerName = match.team2;
      } else {
        winnerName = match.winner; // fallback (in case winner is already a name)
      }
    }
    return (
      <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">{match.date} - {match.time}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center w-5/12">
              <div className={`p-3 rounded-lg text-center w-full mb-2 ${winnerName === match.team1 ? 'bg-green-100 font-bold border-2 border-green-400' : 'bg-blue-50'}`}>
                <span className="font-semibold">{match.team1}</span>
              </div>
            </div>
            <div className="w-2/12 text-center">
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                VS
              </span>
            </div>
            <div className="flex flex-col items-center w-5/12">
              <div className={`p-3 rounded-lg text-center w-full mb-2 ${winnerName === match.team2 ? 'bg-green-100 font-bold border-2 border-green-400' : 'bg-blue-50'}`}>
                <span className="font-semibold">{match.team2}</span>
              </div>
            </div>
          </div>
          {winnerName && (
            <div className="mt-3 flex items-center justify-center">
              <span className="text-green-700 font-bold flex items-center gap-2">
                <Trophy className="inline-block w-5 h-5 text-yellow-500" />
                Winner: {winnerName}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{eventName} Fixtures</h1>
            <p className="text-gray-600 mt-2">View all matches and tournament brackets</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-semibold py-8">{error}</div>
          ) : (
            <>
              {/* Standings Table for Round Robin */}
              {showStandings && standings && standings.length > 0 && (
                <div className="mb-8 bg-blue-50 rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Standings</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="px-3 py-2 border">#</th>
                          <th className="px-3 py-2 border">Team</th>
                          <th className="px-3 py-2 border">P</th>
                          <th className="px-3 py-2 border">W</th>
                          <th className="px-3 py-2 border">D</th>
                          <th className="px-3 py-2 border">L</th>
                          <th className="px-3 py-2 border">GF</th>
                          <th className="px-3 py-2 border">GA</th>
                          <th className="px-3 py-2 border">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((row, idx) => (
                          <tr key={row.teamId || idx} className="border-b">
                            <td className="px-3 py-2 border">{idx + 1}</td>
                            <td className="px-3 py-2 border font-semibold">{row.teamName}</td>
                            <td className="px-3 py-2 border">{row.played}</td>
                            <td className="px-3 py-2 border">{row.won}</td>
                            <td className="px-3 py-2 border">{row.drawn}</td>
                            <td className="px-3 py-2 border">{row.lost}</td>
                            <td className="px-3 py-2 border">{row.goalsFor}</td>
                            <td className="px-3 py-2 border">{row.goalsAgainst}</td>
                            <td className="px-3 py-2 border font-bold">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Fixtures List */}
              {fixtures.length === 0 ? (
                <div className="text-center text-gray-500 font-semibold py-8">No fixtures available.</div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {fixtures.map((round) => (
                    <div key={round.id} className="bg-white rounded-xl shadow p-6">
                      <h2 className="text-xl font-bold mb-4 text-blue-600">{round.round}</h2>
                      <div className="space-y-4">
                        {round.matches.map((match) => (
                          <MatchComponent key={match.id} match={match} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          <div className="mt-12 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Tournament Rules</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>All matches will start at the scheduled time.</li>
              <li>Teams must report 30 minutes before their scheduled match time.</li>
              <li>Match format will be according to international standards.</li>
              <li>The referee's decision will be final and binding.</li>
              <li>Any disputes must be raised with the tournament director.</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Fixtures; 