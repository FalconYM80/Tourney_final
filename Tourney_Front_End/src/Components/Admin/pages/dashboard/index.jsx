import { Box, Typography, Container } from "@mui/material";

import StatsGrid from "./components/StatsGrid";
import TournamentManagement from "./components/TournamentManagement";

import Layout from "../../components/layout/Layout";

const DashboardPage = () => {
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
    <>
    <Layout/>
    <Container
      maxWidth={false}
      sx={{
        py: 4,
        px: { xs: 2, sm: 3 },
        width: "100%",
        "&.MuiContainer-root": {
          // Force full width
          paddingLeft: "16px !important",
          paddingRight: "16px !important",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: "primary.main",
            fontWeight: 600,
            fontSize: "1.8rem",
          }}
        >
          Admin Dashboard
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
          }}
        >
          Manage tournaments, events, and platform operations
        </Typography>
      </Box>

      {/* Stats Cards - Full width */}
      <Box
        sx={{
          width: "100%",
          mb: 4,
          "& .MuiGrid-container": {
            marginLeft: "0 !important",
            marginRight: "0 !important",
        },
    }}
      >
        <StatsGrid {...dashboardData.stats} />
      </Box>

      {/* Tournament Management Section */}
      <TournamentManagement tournaments={dashboardData.tournaments} />
    </Container>

    </>
  );
};

export default DashboardPage;