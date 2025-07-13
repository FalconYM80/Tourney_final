import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Divider,
  Button,
  Tabs,
  Tab,
  Chip,
  Stack,
} from "@mui/material";
import {
  SportsTennis as BadmintonIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";

const TournamentManagement = () => {
  const [tabValue, setTabValue] = useState("all");
  const [selectedTournament, setSelectedTournament] = useState(null);

  const tournaments = [
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
    // Add more tournaments as needed
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        mt: 4,
        animation: "fadeIn 0.5s ease-in-out",
        "@keyframes fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      }}
    >
      {/* Header */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tournament Management
      </Typography>

      {/* Filter Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": {
            height: 3,
            backgroundColor: "#4361ee",
          },
        }}
      >
        <Tab label="All Tournaments" value="all" />
        <Tab label="Pending Approval" value="pending" />
        <Tab label="Approved" value="approved" />
      </Tabs>

      {/* Tournament Card */}
      {tournaments.map((tournament) => (
        <Card
          key={tournament.id}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            },
          }}
        >
          {/* Tournament Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              {tournament.name}
            </Typography>
            <Chip
              label={tournament.status.toUpperCase()}
              color={
                tournament.status === "approved"
                  ? "success"
                  : tournament.status === "rejected"
                  ? "error"
                  : "warning"
              }
              size="small"
            />
          </Box>

          {/* Organizer */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            <strong>Organizer:</strong> {tournament.organizer}
          </Typography>

          {/* Details Table */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" },
              gap: 2,
              mb: 3,
            }}
          >
            <DetailItem label="Dates:" value={tournament.dates} />
            <DetailItem label="Location:" value={tournament.location} />
            <DetailItem label="Events:" value={tournament.events} />
            <DetailItem label="Participants:" value={tournament.participants} />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
              }}
            >
              View
            </Button>
            <Button
              variant="contained"
              startIcon={<ApproveIcon />}
              sx={{
                background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "none",
              }}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              startIcon={<RejectIcon />}
              sx={{
                background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "none",
              }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              startIcon={<DeleteIcon />}
              sx={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "none",
                px: 3,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                  boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)",
                },
                "&.Mui-disabled": {
                  background: "#e5e7eb",
                  color: "#9ca3af",
                },
              }}
            >
              Delete
            </Button>
          </Stack>
        </Card>
      ))}
    </Box>
  );
};

// Reusable detail component
const DetailItem = ({ label, value }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500}>
      {value}
    </Typography>
  </Box>
);

export default TournamentManagement;