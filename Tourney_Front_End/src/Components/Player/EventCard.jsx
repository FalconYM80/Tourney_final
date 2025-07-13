import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "@/Contexts/PlayerContext/PlayerContext";
import { toast } from "react-toastify";

const EventCard = ({
  name,
  fee,
  participants,
  icon,
  tournamentId,
  eventId,
}) => {
  const navigate = useNavigate();
  const { isPlayerLoggedIn } = useContext(PlayerContext);

  const handleRegister = () => {
    // Temporarily disabled login check to allow registration form editing
    if (!isPlayerLoggedIn) {
      toast.info("Please sign in to register for events.");
      navigate("/login/player");
      return;
    }

    // Always proceed to registration for now (temporarily bypassing auth check)
    navigate("/register", {
      state: {
        eventName: name,
        entryFee: fee,
        TournamentId: tournamentId,
        eventId: eventId,
      },
    });
  };

  const handleViewFixture = () => {
    navigate("/fixtures", { state: { eventName: name, tournamentId, eventId } });
  };

  return (
    <Card className="w-full max-w-xs bg-white border border-gray-200 shadow-md rounded-xl flex flex-col justify-between hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <span className="text-2xl">{icon}</span>
        </div>

        <div className="space-y-2 text-gray-700 mb-6">
          <div className="flex justify-between">
            <span>Entry Fee:</span>
            <span className="font-medium">₹{fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Participants:</span>
            <span className="font-medium">{participants} </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full bg-red-500 hover:bg-red-800 text-white py-2 rounded-full cursor-pointer"
            onClick={handleRegister}
          >
            Register Now
          </Button>

          <Button
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-blue-50 py-2 rounded-full cursor-pointer"
            onClick={handleViewFixture}
          >
            View Fixture
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
