import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  Stack,
  Divider,
  Slide,
} from "@mui/material";
import {
  SportsSoccer as SoccerIcon,
  CalendarToday as DateIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

const TournamentCard = ({ tournament }) => {
  return (
    <Slide in direction="up" timeout={500}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          transition: "transform 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 6,
          },
        }}
      >
        <CardContent>
          {/* Header with status chip */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight="bold">
              {tournament.name}
            </Typography>
            <Chip
              label={tournament.status.toUpperCase()}
              color={tournament.status === "approved" ? "success" : "warning"}
              size="small"
            />
          </Box>

          {/* Organizer */}
          <Typography variant="body2" color="text.secondary" mb={2}>
            Organizer: {tournament.organizer}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Details */}
          <Stack spacing={1.5}>
            <Box display="flex" alignItems="center">
              <DateIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">{tournament.dates}</Typography>
            </Box>

            <Box display="flex" alignItems="center">
              <LocationIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">{tournament.location}</Typography>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {tournament.participants} participants
                </Typography>
              </Box>

              <Avatar sx={{ bgcolor: "primary.light" }}>
                <SoccerIcon color="primary" />
              </Avatar>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Slide>
  );
};

// Example tournament data structure
TournamentCard.defaultProps = {
  tournament: {
    name: "Summer Badminton Championship 2024",
    status: "pending",
    organizer: "SportsCorp India",
    dates: "2024-07-15 to 2024-07-20",
    location: "Sports Complex, Mumbai",
    participants: 64,
  },
};

export default TournamentCard;
