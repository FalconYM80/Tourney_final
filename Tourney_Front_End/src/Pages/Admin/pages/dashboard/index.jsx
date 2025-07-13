import { Box, Typography } from "@mui/material";
import StatsGrid from "./components/StatsGrid";
import TournamentsTable from "./components/TournamentsTable";

import { AppContext } from "../../../../Contexts/AppContext/AppContext";
import { useContext } from "react";

import { useEffect } from "react";


const DashboardPage = () => {


  const { updateTournamentStatus } = useContext(AppContext);

  useEffect(()=>{  
    updateTournamentStatus();
  },[]);


  const dashboardData = {
    stats: {
      totalTournaments: 25,
      pendingApprovals: 8,
      activeEvents: 12,
      totalParticipants: 1240,
    },
    tournaments: [
      {
        id: 1,
        name: "Summer Badminton Championship 2024",
        status: "pending",
        organizer: "SportsCorp India",
        dates: "2024-07-15 to 2024-07-20",
        location: "Sports Complex, Mumbai",
        events: 8,
        participants: 64,
      },
      {
        id: 2,
        name: "Football League 2024",
        status: "approved",
        organizer: "Elite Sports Club",
        dates: "2024-08-01 to 2024-08-15",
        location: "National Stadium",
        events: 5,
        participants: 120,
      },
    ],
  };

  return (
    <Box
      sx={{
        maxWidth: 1200, // Adjust for your preferred content width
        mx: "auto", // Center horizontally
        px: { xs: 2, sm: 3 }, // Responsive horizontal padding
        width: "100%",
        py: 4, // Top/bottom padding
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ color: "primary.main", fontWeight: 600, fontSize: "1.8rem" }}
        >
          Admin Dashboard
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "text.secondary", fontSize: "1rem" }}
        >
          Manage tournaments, events, and platform operations
        </Typography>
      </Box>

      <StatsGrid {...dashboardData.stats} />

      <Box>
        <TournamentsTable tournaments={dashboardData.tournaments} />
      </Box>
    </Box>
  );
};

export default DashboardPage;
