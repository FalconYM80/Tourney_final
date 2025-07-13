import React, { useEffect, useState, useContext } from 'react';
import TournamentCard from "../Components/Player/TournamentCard";
import { PlayerContext } from '../Contexts/PlayerContext/PlayerContext';
import { ArrowRight } from "lucide-react";

const MAX_VISIBLE = 8;

const HomeTournamentsSection = () => {
  const { backend_URL } = useContext(PlayerContext);
  const [tournaments, setTournaments] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`${backend_URL}/api/player/tournaments/public`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
          const formatted = data.message.map(tournament => ({
            id: tournament._id,
            title: tournament.name,
            location: tournament.location,
            date: tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
            endDate: tournament.endDate ? new Date(tournament.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
            ageGroups: tournament.events?.map(e => e.ageGroup) || [],
            imageUrl: tournament.coverImage,
            sport: tournament.sport,
            description: tournament.description,
          }));
          setTournaments(formatted);
        }
      } catch (err) {
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, [backend_URL]);

  const visibleTournaments = tournaments.slice(0, MAX_VISIBLE);

  if (loading) return null;
  if (!tournaments.length) return null;

  return (
    <section className="py-12 px-2 md:px-0 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-8">Explore Tournaments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleTournaments.map(tournament => (
          <TournamentCard key={tournament.id} {...tournament} />
        ))}
      </div>
      {tournaments.length > MAX_VISIBLE && (
        <div className="flex justify-center mt-8">
          <a
  href="/tournaments"
  className="bg-primary text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:bg-primary/90 transition flex items-center gap-2"
>
  Explore More
  <ArrowRight className="w-5 h-5" />
</a>
        </div>
      )}
    </section>
  );
};

export default HomeTournamentsSection;
