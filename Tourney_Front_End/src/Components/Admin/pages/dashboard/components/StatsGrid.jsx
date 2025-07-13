import { Grid, Card, Typography, Box, Stack } from "@mui/material";
import {
  EmojiEvents as TournamentsIcon,
  Pending as PendingIcon,
  Event as EventsIcon,
  People as ParticipantsIcon,
} from "@mui/icons-material";

const StatCard = ({ title, value, change, icon }) => (
  <Card
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      p: 3,
      borderRadius: "12px",
      background: "#FFFFFF",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
      },
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          p: 2,
          borderRadius: "10px",
          background: "#EFF6FF",
          color: "#2563EB",
          minWidth: "56px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
    {change && (
      <Typography
        variant="caption"
        color={change.startsWith("+") ? "success.main" : "error.main"}
        sx={{ display: "flex", alignItems: "center", mt: 1.5 }}
      >
        {change} vs last week
      </Typography>
    )}
  </Card>
);

const StatsGrid = () => (
  <Grid
    container
    spacing={3}
    sx={{
      mb: 4,
      transition: "margin 0.3s ease",
      width: "100%",
    }}
  >
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <StatCard
        title="Total Tournaments"
        value="25"
        icon={<TournamentsIcon />}
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <StatCard
        title="Pending Approvals"
        value="8"
        change="+6"
        icon={<PendingIcon />}
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <StatCard
        title="Active Events"
        value="12"
        change="-2"
        icon={<EventsIcon />}
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <StatCard
        title="Total Participants"
        value="1,240"
        change="+120"
        icon={<ParticipantsIcon />}
      />
    </Grid>
  </Grid>
);

export default StatsGrid;