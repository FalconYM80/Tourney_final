import TournamentCard from "@/Components/Player/TournamentCard";
// import Navbar from "@/Components/Navbar";
import { Button } from "@/Components/ui/button";
import Footer from "@/Components/Footer";
import Navigation from "@/Components/Navigation";
import { useState, useEffect, useMemo } from "react";
import { useContext } from "react";
// @ts-ignore - Add ignore to bypass TypeScript error for now
import { PlayerContext } from "../../Contexts/PlayerContext/PlayerContext";
// @ts-ignore - Add ignore to bypass TypeScript error for now
import { AppContext } from "../../Contexts/AppContext/AppContext";
import { toast } from "react-toastify";

// Tournament type definition
interface Tournament {
  id: string | number;
  title: string;
  location: string;
  date: string;
  endDate?: string;
  ageGroups: string[];
  imageUrl: string;
  sport: string;
  description?: string;
  status?: string;
}

// PlayerContext type definition
interface PlayerContextType {
  backend_URL: string;
  isPlayerLoggedIn: boolean;
  setIsPlayerLoggedIn: (value: boolean) => void;
  playerData: any;
  setPlayerData: (value: any) => void;
  playerMail: string;
  setPlayerMail: (value: string) => void;
  getAuthStatusPlayer: () => Promise<void>;
}

// AppContext type definition
interface AppContextType {
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
}

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

const Tournaments = () => {
  // Cast context to defined type
  const { backend_URL } = useContext(PlayerContext) as PlayerContextType;
  const { selectedLocation } = useContext(AppContext) as AppContextType;
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Upcoming' | 'Active' | 'Completed' | 'cancelled'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Add animation state
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Set page loaded to true after a short delay to trigger animations
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // 1. Add credentials to ensure cookies are sent
        const response = await fetch(`${backend_URL}/api/player/tournaments/public`, {
          credentials: 'include'
        });

        // 2. Check if response is ok before trying to parse JSON
        if (!response.ok) {
          console.error(`Server responded with status ${response.status}: ${response.statusText}`);
          throw new Error(`Server error: ${response.status}`);
        }

        // 3. Now try to parse the JSON response
        
        const data = await response.json();
        console.log(data);
        
        if (data.success) {
          const formattedTournaments = data.message.map((tournament: any) => {
            return {
              id: tournament._id,
              title: tournament.name,
              location: tournament.location,
              date: formatDate(tournament.startDate),
              endDate: formatDate(tournament.endDate),
              ageGroups: tournament.events?.map((event: any) => event.ageGroup) || [],
              imageUrl: tournament.coverImage,
              sport: tournament.sport,
              description: tournament.description,
              status: tournament.status,
            };
          });
          
          setTournaments(formattedTournaments);
        } else {
          console.error("API returned success:false", data.message);
          toast.error("Failed to load tournaments");
          // Fallback to demo data
          setTournaments([
            {
              id: 1,
              title: "State Level Basketball Tournament",
              location: "Bangalore stadium", 
              date: "5th July 2025",
              endDate: "7th July 2025",
              ageGroups: ["U-17", "U-19", "U-21"],
              imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
              sport: "Basketball",
              description: "# State Level Basketball Tournament\n\nJoin us for an exciting basketball tournament featuring teams from across the state. Multiple age categories available.\n\n## Tournament Format\n\n- Group stage followed by knockout rounds\n- Professional referees\n- State-of-the-art facilities\n\n## Prizes\n\nWinners will receive trophies and certificates."
            },
            {
              id: 2,
              title: "District Football Tournament",
              location: "Chennai stadium",
              date: "15th March 2025", 
              endDate: "17th March 2025",
              ageGroups: ["U-14", "U-16"],
              imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
              sport: "Football",
              description: "# District Football Tournament\n\nCompete in our annual district football tournament. Teams from across the region will participate in this prestigious event.\n\n## Tournament Details\n\n- League format followed by playoffs\n- Qualified referees\n- Multiple age categories\n\n## Awards\n\nChampionship trophies and individual awards for outstanding players."
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        toast.error("Error loading tournaments. Using demo data.");
        // Fallback to demo data
        setTournaments([
  {
    id: 1,
    title: "State Level Basketball Tournament",
    location: "Bangalore stadium", 
    date: "5th July 2025",
            endDate: "7th July 2025",
    ageGroups: ["U-17", "U-19", "U-21"],
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
            sport: "Basketball",
            description: "# State Level Basketball Tournament\n\nJoin us for an exciting basketball tournament featuring teams from across the state. Multiple age categories available.\n\n## Tournament Format\n\n- Group stage followed by knockout rounds\n- Professional referees\n- State-of-the-art facilities\n\n## Prizes\n\nWinners will receive trophies and certificates."
  },
  {
    id: 2,
    title: "District Football Tournament",
    location: "Chennai stadium",
    date: "15th March 2025", 
            endDate: "17th March 2025",
    ageGroups: ["U-14", "U-16"],
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
            sport: "Football",
            description: "# District Football Tournament\n\nCompete in our annual district football tournament. Teams from across the region will participate in this prestigious event.\n\n## Tournament Details\n\n- League format followed by playoffs\n- Qualified referees\n- Multiple age categories\n\n## Awards\n\nChampionship trophies and individual awards for outstanding players."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [backend_URL]);

  // Helper function to format date from ISO to "5th July 2025" format
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    // Add ordinal suffix
    const ordinal = (d: number) => {
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

  const parseDate = (dateString: string) => {
    // Convert "9th February 2025" to Date object
    const months = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    
    const parts = dateString.split(' ');
    const day = parseInt(parts[0].replace(/\D/g, ''));
    
    const month = months[parts[1] as keyof typeof months];
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
  };

  const categorizeDate = (dateString: string) => {
    const tournamentDate = parseDate(dateString);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tournamentStart = new Date(tournamentDate.getFullYear(), tournamentDate.getMonth(), tournamentDate.getDate());
    
    if (tournamentStart < todayStart) return 'past';
    if (tournamentStart.getTime() === todayStart.getTime()) return 'ongoing';
    return 'upcoming';
  };

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      const statusMatch = selectedStatus === 'all' || tournament.status === selectedStatus;
      const categoryMatch = selectedCategory === 'all' || tournament.sport?.toLowerCase() === selectedCategory.toLowerCase();
    const locationMatch = selectedLocation === 'all' || (tournament.location && tournament.location.toLowerCase().includes(selectedLocation.toLowerCase()));
      const searchMatch =
        searchTerm.trim() === '' ||
        tournament.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.sport?.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && categoryMatch && locationMatch && searchMatch;
    });
  }, [tournaments, selectedStatus, selectedCategory, selectedLocation, searchTerm]);

  const getFilterCount = (filter: 'all' | 'upcoming' | 'ongoing' | 'past') => {
    if (filter === 'all') return tournaments.length;
    return tournaments.filter(tournament => categorizeDate(tournament.date) === filter).length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Add the animation styles */}
      <style>{animationStyles}</style>
      
      <Navigation />
      <div className="container mx-auto px-4 py-8">
      
        <div className={`text-center mb-12 ${pageLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
          
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent max-w-3xl mx-auto text-center leading-snug mb-8 mt-14">
            Unleash your potential — compete, connect, and conquer tournaments across disciplines!
          </p>
          <div className="w-full md:w-1/2 mx-auto">
  <input
    type="text"
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    placeholder="Search tournaments by name, location, or sport..."
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
  />
</div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-4 text-muted-foreground">Loading tournaments...</p>
          </div>
        ) : (
          <>
            {/* Filter Buttons + Category Dropdown Row */}
            <div className={`flex flex-wrap justify-between items-center mb-8 max-w-6xl mx-auto px-4 ${pageLoaded ? 'animate-slide-up delay-100' : 'opacity-0'}`}>
              
              {/* Filters Group */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                {/* Search Bar */}
                <div className="flex flex-col md:flex-row w-full md:items-center md:gap-4">
                  <div className="flex gap-2 flex-wrap mb-2 md:mb-0">
                    <Button
                      variant={selectedStatus === 'all' ? 'default' : 'outline'}
                      onClick={() => setSelectedStatus('all')}
                      className="px-6 py-2"
                    >
                      All ({tournaments.length})
                    </Button>
                    <Button
                      variant={selectedStatus === 'Upcoming' ? 'default' : 'outline'}
                      onClick={() => setSelectedStatus('Upcoming')}
                      className="px-6 py-2"
                    >
                      Upcoming ({tournaments.filter(t => t.status === 'Upcoming').length})
                    </Button>
                    <Button
                      variant={selectedStatus === 'Active' ? 'default' : 'outline'}
                      onClick={() => setSelectedStatus('Active')}
                      className="px-6 py-2"
                    >
                      Active ({tournaments.filter(t => t.status === 'Active').length})
                    </Button>
                    <Button
                      variant={selectedStatus === 'Completed' ? 'default' : 'outline'}
                      onClick={() => setSelectedStatus('Completed')}
                      className="px-6 py-2"
                    >
                      Completed ({tournaments.filter(t => t.status === 'Completed').length})
                    </Button>
                  </div>
                  
                </div>
               
                
              </div>
              
              {/* Display current location filter if active */}
              {selectedLocation !== 'all' && (
                <div className="mt-2 md:mt-0 px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium flex items-center">
                  <span>Location: {selectedLocation}</span>
                </div>
              )}
              
              <div className="mt-4 md:mt-0 flex gap-4 items-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`px-6 py-2 rounded-md focus:outline-none cursor-pointer
                  ${selectedCategory === 'all' ? 'bg-transparent text-red-500' : 'bg-transparent text-red-500'}
                `}
                >
                  
                  <option value="all">All Sports</option>
                  <option value="basketball">Basketball</option>
                  <option value="football">Football</option>
                  <option value="cricket">Cricket</option>
                  <option value="badminton">Badminton</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Table Tennis">Table Tennis</option>
                  <option value="Chess">Chess</option>
                  <option value="Kabaddi">Kabaddi</option>
                  <option value="Hockey">Hockey</option>
                  <option value="Archery">Archery</option>
                  <option value="Swimming">Swimming</option>
                </select>
                
              </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto ${pageLoaded ? 'animate-fade-in delay-200' : 'opacity-0'}`}>
              {filteredTournaments.map((tournament, index) => (
                <div 
                  key={index}
                  className={`${pageLoaded ? 'animate-fade-in card-animation' : 'opacity-0'}`} 
                  style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                >
                  <TournamentCard
                  key={index}
                    id={tournament.id} 
                    title={tournament.title}
                    location={tournament.location}
                    date={tournament.date}
                    endDate={tournament.endDate}
                    ageGroups={tournament.ageGroups}
                    imageUrl={tournament.imageUrl}
                    sport={tournament.sport}
                    description={tournament.description}
                  />
                </div>
              ))}
            </div>

            {filteredTournaments.length === 0 && (
              <div className={`text-center py-12 ${pageLoaded ? 'animate-fade-in delay-200' : 'opacity-0'}`}>
                <p className="text-muted-foreground text-lg">
                  No {selectedStatus === 'all' ? '' : selectedStatus} tournaments found
                  {selectedLocation !== 'all' ? ` in ${selectedLocation}` : ''}.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="py-8" />
      <Footer />
    </div>
  );
};

export default Tournaments;
