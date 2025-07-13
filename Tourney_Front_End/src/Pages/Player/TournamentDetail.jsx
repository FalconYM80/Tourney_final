import { Calendar, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const TournamentDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [submitted, setSubmitted] = useState(false);

  // Set active tab from location state if provided
  useEffect(() => {
    if (location.state && location.state.selectedTab) {
      setActiveTab(location.state.selectedTab);
    }
  }, [location.state]);

  const tournamentData = {
    name: "State Level Basketball Tournament",
    location: "Bangalore stadium",
    date: "9th February 2025",
    categories: ["U-17", "U-19", "U-21", "U-23"],
    image: "/placeholder.svg",
    countdown: {
      days: 74,
      hours: 23,
      minutes: 12
    },
    eventDate: {
      day: 29,
      month: "JAN",
      year: 2025
    }
  };

  const fixtures = [
    {
      category: "Football",
      ageGroup: "U-17 ( BOYS )",
      entries: 135,
      type: "League Match"
    },
    {
      category: "Football",
      ageGroup: "U-17 ( BOYS )",
      entries: 135,
      type: "League Match"
    },
    {
      category: "Football",
      ageGroup: "U-17 ( BOYS )",
      entries: 135,
      type: "League Match"
    },
    {
      category: "Football",
      ageGroup: "U-17 ( BOYS )",
      entries: 135,
      type: "League Match"
    }
  ];

  const matches = [
    {
      time: "9:00 AM",
      round: "Semi Finals - 1",
      players: [
        { name: "Player 1", scores: [45, 56, 34, 21, 34] },
        { name: "Player 2", scores: [40, 52, 20, 18, 31] }
      ]
    },
    {
      time: "9:00 AM",
      round: "Semi Finals - 1",
      players: [
        { name: "Player 1", scores: [45, 56, 34, 21, 34] },
        { name: "Player 2", scores: [40, 52, 20, 18, 31] }
      ]
    }
  ];

  const players = [
    { name: "PlayerName", team: "bengaluru rivals", category: "U17" },
    { name: "PlayerName", team: "bengaluru rivals", category: "U17" },
    { name: "PlayerName", team: "bengaluru rivals", category: "U17" },
    { name: "PlayerName", team: "bengaluru rivals", category: "U17" }
  ];

  const teams = [
    { name: "Team Football Club", location: "Bengaluru Rivals", category: "U-17" },
    { name: "Team Football Club", location: "Bengaluru Rivals", category: "U-17" }
  ];

  const [showForm, setShowForm] = useState(false);
const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: ""
});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Form Submitted:", formData);
  setSubmitted(true); // show the Payment Summary
};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Sports Categories */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-2xl">🏀</span>
                  </div>
                  <span className="text-sm text-gray-600">Basketball</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tournament Detail Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex space-x-6 mb-6">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  <img 
                    src={tournamentData.image} 
                    alt={tournamentData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-primary mb-2">{tournamentData.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{tournamentData.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{tournamentData.date}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Categories:</p>
                    <div className="flex space-x-2">
                      {tournamentData.categories.map((category, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-primary text-white text-xs rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
                  <TabsTrigger value="matches">Matches</TabsTrigger>
                  <TabsTrigger value="players">Players</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-700 mb-4">
                        Gear up for an exhilarating tournament at the State Level Basketball Tournament! Rally your team of up to 6 Players and register now to secure the championship title and amazing trophies. Don't miss your chance to shine on the court!
                      </p>
                      
                      <div className="bg-primary text-white p-4 rounded-lg">
                        <h3 className="text-lg font-bold mb-2">
                          {tournamentData.countdown.days}:{tournamentData.countdown.hours}:{tournamentData.countdown.minutes}
                        </h3>
                        <p className="text-sm">Event Starts in</p>
                      </div>
                    </div>
                    
                    <div className="bg-primary text-white p-6 rounded-lg text-center">
                      <div className="text-4xl font-bold">{tournamentData.eventDate.day}</div>
                      <div className="text-lg">{tournamentData.eventDate.month}</div>
                      <div className="text-lg">{tournamentData.eventDate.year}</div>
                      <div className="text-sm mt-2">Last Date To Register</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">event details go here</h3>
                  </div>
                  
                  <Button
  className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-3"
  onClick={() => setShowForm(!showForm)}
>
  {showForm ? "Hide Registration Form" : "Register Now"}
</Button>

{showForm && (
  <form onSubmit={handleSubmit} className="mt-6 bg-white border p-6 rounded-lg space-y-4">
    <input
      type="text"
      name="name"
      placeholder="Full Name"
      value={formData.name}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 rounded-md"
      required
    />
    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 rounded-md"
      required
    />
    <input
      type="tel"
      name="phone"
      placeholder="Mobile Number"
      value={formData.phone}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 rounded-md"
      required
    />
    <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
      Submit Registration
    </Button>

    {submitted && (
  <div className="mt-6 border rounded-lg p-6 shadow-sm bg-white">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
    <div className="space-y-2 text-sm text-gray-700">
      <div className="flex justify-between">
        <span>Registration Fee</span>
        <span>₹500</span>
      </div>
      <div className="flex justify-between">
        <span>GST (18%)</span>
        <span>₹90</span>
      </div>
      <div className="flex justify-between font-semibold text-primary">
        <span>Total</span>
        <span>₹590</span>
      </div>
    </div>
    <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-white">
      Proceed to Payment
    </Button>
  </div>
)}
  </form>
)}
                </TabsContent>
                
                <TabsContent value="fixtures" className="mt-6">
                  <div className="space-y-4">
                    {fixtures.map((fixture, index) => (
                      <Card key={index} className="bg-primary text-white">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold">{fixture.category}</h3>
                              <p className="text-sm opacity-90">{fixture.ageGroup}</p>
                              <p className="text-xs opacity-75">{fixture.entries} entries</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm">{fixture.type}</span>
                              <Button variant="outline" size="sm" className="ml-2 text-primary bg-white">
                                Fixtures
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="matches" className="mt-6">
                  <div className="mb-6">
                    <div className="flex justify-center space-x-4 mb-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-lg">8</div>
                        <div className="text-xs text-gray-600 mt-1">MAR</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-lg">9</div>
                        <div className="text-xs text-gray-600 mt-1">MAR</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-lg">10</div>
                        <div className="text-xs text-gray-600 mt-1">MAR</div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Match schedule</h3>
                    <p className="text-sm text-gray-600 mb-4">Sunday, March 9 2025</p>
                    
                    <div className="mb-4">
                      <input 
                        type="text" 
                        placeholder="Search in players and teams"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {matches.map((match, index) => (
                      <div key={index}>
                        <h4 className="font-bold text-gray-900 mb-2">{match.time}</h4>
                        <Card className="bg-primary text-white">
                          <CardContent className="p-4">
                            <h5 className="font-bold mb-3">{match.round}</h5>
                            {match.players.map((player, playerIndex) => (
                              <div key={playerIndex} className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-white rounded-full mr-3"></div>
                                  <span>{player.name}</span>
                                </div>
                                <div className="flex space-x-2">
                                  {player.scores.map((score, scoreIndex) => (
                                    <span key={scoreIndex} className="w-8 text-center">{score}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="players" className="mt-6">
                  <div className="mb-4">
                    <input 
                      type="text" 
                      placeholder="Search in players and teams"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-primary text-white px-3 py-1 rounded inline-block text-sm font-bold">A</div>
                    {players.map((player, index) => (
                      <Card key={index} className="border-primary border-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{player.name}</h3>
                                <p className="text-sm text-gray-600">{player.team}</p>
                              </div>
                            </div>
                            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                              {player.category}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="bg-primary text-white px-3 py-1 rounded inline-block text-sm font-bold">B</div>
                    <Card className="border-primary border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">PlayerName</h3>
                              <p className="text-sm text-gray-600">bengaluru rivals</p>
                            </div>
                          </div>
                          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                            U17
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="teams" className="mt-6">
                  <div className="mb-4">
                    <input 
                      type="text" 
                      placeholder="Search in players and teams"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-primary text-white px-3 py-1 rounded inline-block text-sm font-bold">A</div>
                    {teams.map((team, index) => (
                      <Card key={index} className="border-primary border-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                                  <span className="text-black text-xs font-bold">FC</span>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{team.name}</h3>
                                <p className="text-sm text-gray-600">{team.location}</p>
                                <p className="text-xs text-gray-500">bangalore • Karnataka</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                                {team.category}
                              </span>
                            </div>
                          </div>
                          <Button className="w-full mt-3 bg-primary hover:bg-primary/90 text-white">
                            View All Players →
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TournamentDetail;
