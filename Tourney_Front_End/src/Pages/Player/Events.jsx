import EventCard from "@/components/Player/EventCard";
// import TournamentDescription from "@/components/TournamentDescription";
import { Calendar, MapPin, Users } from "lucide-react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useState, useEffect, useContext } from "react";
// @ts-ignore
import { PlayerContext } from "@/Contexts/PlayerContext/PlayerContext";
import { toast } from "react-toastify";
import { marked } from 'marked';






// Add CSS for animations
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUpFade {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.7s ease forwards;
  }
  
  .animate-slide-up {
    animation: slideUpFade 0.7s ease forwards;
  }
  
  .delay-100 {
    animation-delay: 100ms;
  }
  
  .delay-200 {
    animation-delay: 200ms;
  }
  
  .delay-300 {
    animation-delay: 300ms;
  }
  
  .card-animation {
    opacity: 0;
    animation: fadeIn 0.5s ease forwards;
  }
`;

// Helper function to format date from ISO to readable format
const formatDate = (isoDate) => {
  if (!isoDate) return null;
  
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  
  // Add ordinal suffix
  const ordinal = (d) => {
    if (d > 3 && d < 21) return `${d}th`;
    switch (d % 10) {
      case 1: return `${d}st`;
      case 2: return `${d}nd`;
      case 3: return `${d}rd`;
      default: return `${d}th`;
    }
  };
  
  return `${ordinal(day)} ${month} ${year}`;
};

const Event = () => {
  const location = useLocation();
  const initialTournamentData = location.state;
  console.log(initialTournamentData);
  const { id } = useParams(); // Get tournament ID from URL
  const navigate = useNavigate();
  
  // Add animation state
  const [pageLoaded, setPageLoaded] = useState(false);
  
  useEffect(() => {
    // Set page loaded to true after a short delay to trigger animations
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add a dummy description for testing if none exists
  const tournamentWithDescription = initialTournamentData 
    ? {
        ...initialTournamentData,
        coverImage: initialTournamentData.imageUrl,
        description: initialTournamentData.description || 
          `# ${initialTournamentData.title || 'Tournament'} Details\n\n` +
          `Welcome to the ${initialTournamentData.title || 'Tournament'}! This is a premier event for ${initialTournamentData.sport || 'sports'} enthusiasts.\n\n` +
          `## Event Format\n\n` +
          `- Multiple age categories\n` +
          `- Professional referees\n` +
          `- State-of-the-art facilities\n\n` +
          `## Prizes\n\n` +
          `Winners will receive trophies and certificates. Join us for an unforgettable sporting experience!`
      } 
    : {};
  
  const [tournament, setTournament] = useState(tournamentWithDescription || {});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { backend_URL } = useContext(PlayerContext);
  
  // Check if we have tournament data to display
  useEffect(() => {
    if (!initialTournamentData && !id) {
      // Redirect to tournaments page if no tournament data is available
      toast.error("No tournament selected. Redirecting to tournaments list.");
      navigate('/tournaments');
    }
  }, [initialTournamentData, id, navigate]);

  // If we have an ID but no data, fetch the tournament details
  useEffect(() => {
    const fetchTournamentDetails = async () => {
      if (!initialTournamentData && id) {
        try {
          const response = await fetch(`http://localhost:8000/api/player/tournaments/${id}`, {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.message) {
            const tournamentData = {
              _id: data.message._id,
              title: data.message.name,
              location: data.message.location,
              sport: data.message.sport,
              description: data.message.description,
              imageUrl: data.message.coverImage,
              date: formatDate(data.message.startDate),
              endDate: formatDate(data.message.endDate)
            };
            setTournament({
              ...tournamentData,
              description: tournamentData.description || 
                `# ${tournamentData.title || 'Tournament'} Details\n\n` +
                `Welcome to the ${tournamentData.title || 'Tournament'}! This is a premier event for ${tournamentData.sport || 'sports'} enthusiasts.\n\n` +
                `## Event Format\n\n` +
                `- Multiple age categories\n` +
                `- Professional referees\n` +
                `- State-of-the-art facilities\n\n` +
                `## Prizes\n\n` +
                `Winners will receive trophies and certificates. Join us for an unforgettable sporting experience!`
            });
          }
        } catch (error) {
          console.error("Error fetching tournament details:", error);
          toast.error("Failed to load tournament details");
        }
      }
    };
    
    fetchTournamentDetails();
  }, [id, initialTournamentData]);

  useEffect(() => {
    const fetchEvents = async () => {
      // If no tournament data is available, don't attempt to fetch events
      if (!initialTournamentData?._id && !id) {
        setLoading(false);
        console.log("COmming here");
        return;
      }
      
      try {
        // Use tournament ID from state or URL params
        const tournamentId = initialTournamentData?._id || id;
        if (!tournamentId) {
          setLoading(false);
          return;
        }
        console.log("Comming Here");
        const response = await fetch(`${backend_URL}/api/player/tournaments/${tournamentId}/events`, {
          credentials: 'include' // Add credentials for cookies
        });
        const data = await response.json();
        console.log(data);
        if (data.success) {
          // Format the event data for EventCard component
          const formattedEvents = data.message.map(event => ({
            id: event._id,
            name: event.name,
            fee: event.entryFee || 1000,
            participants: (event.participantsIndividual?.length || 0) + (event.participantsGroup?.length || 0),
            ageGroup: event.ageGroup || "Open",
            icon: getSportIcon(tournament?.sport) || "🎮"
          }));
          
          setEvents(formattedEvents);
        } else {
          // Fallback to demo data if API fails
          setEvents([
            { name: "Men's Singles", fee: 1000, participants: 64, icon: "🎾" },
            { name: "Men's Doubles", fee: 1500, participants: 32, icon: "👥" },
            { name: "Women's Singles", fee: 1000, participants: 32, icon: "🎾" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Error loading events. Using demo data.");
        setEvents([
          { name: "Men's Singles", fee: 1000, participants: 64, icon: "🎾" },
          { name: "Men's Doubles", fee: 1500, participants: 32, icon: "👥" },
          { name: "Women's Singles", fee: 1000, participants: 32, icon: "🎾" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [initialTournamentData, id, tournament?.sport]);
  
  // Helper function to get sport-specific icon
  const getSportIcon = (sport) => {
    const icons = {
      "Basketball": "🏀",
      "Football": "⚽",
      "Tennis": "🎾",
      "Volleyball": "🏐",
      "Badminton": "🏸",
      "Cricket": "🏏",
      "Chess": "♟️"
    };
    return icons[sport] || "🎮";
  };

  // If still loading or no tournament selected, show loading state or return early
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-4 text-lg text-muted-foreground">Loading tournament details...</p>
      </div>
    );
  }

  if (!tournament && !loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-muted-foreground">
        <p className="text-lg">No tournament selected. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Add the animation styles */}
      <style>{animationStyles}</style>
      
      <Navigation />

      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-center mb-12 ${pageLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="flex space-x-8">
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-3xl">🏆</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{tournament?.sport}</span>
              </div>
            </div>
          </div>

          <div className={`flex items-center justify-between mb-8 ${pageLoaded ? 'animate-fade-in delay-100' : 'opacity-0'}`}>
            <h1 className="text-4xl font-bold text-foreground">{tournament?.title}</h1>
          </div>

          <Card className={`bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow mb-12 overflow-hidden p-0 ${pageLoaded ? 'animate-slide-up delay-100' : 'opacity-0'}`}>
            <div className="flex flex-col lg:flex-row h-full">
              {/* Image Section */}
              <div className="lg:w-80 w-full flex-shrink-0 h-[500px] lg:h-[400px] relative group">
                <img
                  src={tournament?.imageUrl || "/placeholder.svg"}
                  alt={tournament?.title}
                  className="w-full h-full object-cover object-center"
                />
                {/* View Poster Button - Only visible on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <button 
                    onClick={() => window.open(tournament?.imageUrl || "/placeholder.svg", "_blank")}
                    className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/80 hover:text-white transition-colors"
                  >
                    View Poster
                  </button>
                </div>
              </div>

              {/* Text Section */}
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-4">{tournament?.title}</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                      <span className="text-lg">{tournament?.location || "Location not specified"}</span>
                    </div>

                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-5 h-5 text-primary mr-2" />
                      <span className="text-lg">
                        {tournament?.date || "Date not specified"}
                        {tournament?.endDate && ` - ${tournament?.endDate}`}
                      </span>
                    </div>

                    <div className="flex items-center text-muted-foreground">
                      
                    </div>
                  </div>

                  {/* <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Registration Open
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Deadline: {tournament?.deadline || "TBD"}
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
          </Card>

          <div className={`mb-12 ${pageLoaded ? 'animate-fade-in delay-200' : 'opacity-0'}`}>
            <h2 className="text-2xl font-bold text-foreground mb-8">Tournament Events</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-4 text-muted-foreground">Loading events...</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.length > 0 ? (
                  events.map((event, index) => (
                    <div 
                      key={event.id || index}
                      className={`${pageLoaded ? 'card-animation' : 'opacity-0'}`} 
                      style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                    >
                  <EventCard
                    name={event.name}
                    fee={event.fee}
                    participants={event.participants}
                    icon={event.icon}
                    tournamentId={initialTournamentData?._id || id}
                    eventId={event.id}
                    onBook={() => console.log(`Registering for ${event.name}`)}
                  />
                    </div>
                  ))
                ) : (
                  <p className="col-span-3 text-center text-muted-foreground">No events found for this tournament.</p>
                )}
            </div>
            )}
          </div>

          <Card className={`bg-green-50 border-green-200 rounded-2xl p-6 mb-12 ${pageLoaded ? 'animate-fade-in delay-300' : 'opacity-0'}`}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Organizer</h3>
                    <p className="text-muted-foreground">Play Extreme</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    Verified Organizer
                  </span>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tournament description section */}
          <div className={`mb-12 ${pageLoaded ? 'animate-fade-in delay-300' : 'opacity-0'}`}>
            <h2 className="text-2xl font-bold text-foreground mb-6">About This Tournament</h2>
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-6">
                {tournament?.description ? (
                  <div className="prose max-w-none tournament-description-content"
                       dangerouslySetInnerHTML={{ __html: marked(tournament?.description || '') }}
                  />
                ) : (
                  <p className="text-muted-foreground text-center">No description available for this tournament.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Event;