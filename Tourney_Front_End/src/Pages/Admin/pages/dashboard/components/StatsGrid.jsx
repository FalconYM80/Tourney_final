import React, { useEffect, useState, useContext } from "react";
import {
  Grid,
  Card,
  Typography,
  Box,
  Stack,
  Container,
  alpha,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  EmojiEvents as TournamentsIcon,
  Event as EventsIcon,
  Groups as OrganizationsIcon,
  People as ParticipantsIcon,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { AdminContext } from "../../../../../Contexts/AdminContext/AdminContext"; // adjust path as needed

const API_BASE_URL = "http://localhost:8000"; // your backend base URL

// Change Indicator (No dots here)
const ChangeIndicator = ({ change }) => {
  if (!change) return null;
  const isPositive = change.startsWith("+");
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
      {isPositive ? (
        <TrendingUp sx={{ fontSize: 16, color: "#22c55e" }} />
      ) : (
        <TrendingDown sx={{ fontSize: 16, color: "#ef4444" }} />
      )}
      <Typography
        variant="caption"
        sx={{
          color: isPositive ? "#22c55e" : "#ef4444",
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      >
        {change} vs last week
      </Typography>
    </Stack>
  );
};

// Clean Professional Card (Zero dots)
const CleanCard = ({ title, value, change, icon, accentColor }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      <Card
        elevation={0}
        sx={{
          height: 160,
          width: "250px",
          borderRadius: 2,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "& .MuiPagination-root": { display: "none" },
          "& .swiper-pagination": { display: "none !important" },
          "& .slick-dots": { display: "none !important" },
          "& [class*='dot']": { display: "none !important" },
          "& [class*='pagination']": { display: "none !important" },
          "&:hover": {
            border: `1px solid ${alpha(accentColor, 0.3)}`,
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            transform: "translateY(-2px)",
          },
          "&::before, &::after": { display: "none" },
        }}
      >
        {/* Top accent line */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: accentColor,
          }}
        />

        <Box sx={{ p: 3, height: "100%", position: "relative" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 2 }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                background: alpha(accentColor, 0.08),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              {React.cloneElement(icon, {
                sx: { fontSize: 22, color: accentColor },
              })}
            </Box>

            {/* Title */}
            <Box sx={{ textAlign: "right", flex: 1, ml: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {title}
              </Typography>
            </Box>
          </Stack>

          {/* Value */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              lineHeight: 1.1,
              mb: 0.5,
            }}
          >
            {value}
          </Typography>

          {/* Change Indicator */}
          <ChangeIndicator change={change} />
        </Box>
      </Card>
    </motion.div>
  );
};

const StatsGrid = () => {
  const { token, isLoggedIn } = useContext(AdminContext);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    organizations: 0,
    tournaments: 0,
    events: 0,
    players: 0,
  });
  const [error, setError] = useState("");

  async function fetchTotals() {
    if (!isLoggedIn || !token) return;
    setLoading(true);
    setError("");
    try {
      const [orgRes, tourRes, eventRes, playerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/total-organizations`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
        fetch(`${API_BASE_URL}/admin/total-tournaments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
        fetch(`${API_BASE_URL}/admin/total-events`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
        fetch(`${API_BASE_URL}/admin/total-players`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
      ]);
      setTotals({
        organizations: orgRes.totalOrganizations,
        tournaments: tourRes.totalTournaments,
        events: eventRes.totalEvents,
        players: playerRes.totalPlayers,
      });
    } catch (err) {
      setError("Failed to fetch stats.");
      setTotals({
        organizations: 0,
        tournaments: 0,
        events: 0,
        players: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTotals();
    // eslint-disable-next-line
  }, [isLoggedIn, token]);

  const accentColors = {
    organizations: "#6366f1",
    tournaments: "#3b82f6",
    events: "#06b6d4",
    players: "#10b981",
  };

  const cards = [
    {
      title: "Organizations",
      value: loading ? <CircularProgress size={28} /> : totals.organizations,
      icon: <OrganizationsIcon />,
      accentColor: accentColors.organizations,
    },
    {
      title: "Tournaments",
      value: loading ? <CircularProgress size={28} /> : totals.tournaments,
      icon: <TournamentsIcon />,
      accentColor: accentColors.tournaments,
    },
    {
      title: "Events",
      value: loading ? <CircularProgress size={28} /> : totals.events,
      icon: <EventsIcon />,
      accentColor: accentColors.events,
    },
    {
      title: "Players",
      value: loading ? <CircularProgress size={28} /> : totals.players,
      icon: <ParticipantsIcon />,
      accentColor: accentColors.players,
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        "& .MuiPagination-root": { display: "none !important" },
        "& .swiper-pagination": { display: "none !important" },
        "& .swiper-pagination-bullet": { display: "none !important" },
        "& .slick-dots": { display: "none !important" },
        "& .slick-dots li": { display: "none !important" },
        "& [class*='dot']": { display: "none !important" },
        "& [class*='pagination']": { display: "none !important" },
        "& [class*='indicator']": { display: "none !important" },
        "& [class*='bullet']": { display: "none !important" },
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          {cards.map((stat, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              key={stat.title}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <CleanCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsGrid;
