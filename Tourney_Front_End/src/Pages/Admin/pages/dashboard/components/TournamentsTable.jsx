import React, { useState, useEffect, useContext } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  useTheme,
  Stack,
  useMediaQuery,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  SportsSoccer,
  SportsTennis,
  SportsVolleyball,
  Event,
  LocationOn,
  Group,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { AdminContext } from "../../../../../Contexts/AdminContext/AdminContext"; // Adjust path as needed

const API_BASE_URL = "http://localhost:8000";

// Icon mapping
const sportIcons = {
  football: <SportsSoccer fontSize="medium" />,
  badminton: <SportsTennis fontSize="medium" />,
  volleyball: <SportsVolleyball fontSize="medium" />,
};

// Status chip
function StatusChip({ status }) {
  const theme = useTheme();
  const statusMap = {
    approved: { color: "success", label: "APPROVED" },
    pending: { color: "warning", label: "PENDING" },
    cancelled: { color: "error", label: "CANCELLED" },
    active: { color: "info", label: "ACTIVE" },
    completed: { color: "primary", label: "COMPLETED" },
  };
  return (
    <Chip
      label={statusMap[status]?.label || status}
      color={statusMap[status]?.color || "default"}
      sx={{
        fontWeight: 600,
        borderRadius: 1,
        px: 1.5,
        letterSpacing: 0.5,
        fontSize: "0.85rem",
      }}
      size="small"
      aria-label={`Status: ${statusMap[status]?.label || status}`}
    />
  );
}

// Progress bar with label (optional, but kept for consistency)
function ProgressWithLabel({ value }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
          aria-label={`Progress: ${value}%`}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" minWidth={35}>
        {`${Math.round(value)}%`}
      </Typography>
    </Stack>
  );
}

export default function TournamentsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { token, isLoggedIn } = useContext(AdminContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchTournaments() {
    if (!isLoggedIn || !token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tournaments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch tournaments");
      const data = await response.json();
      setTournaments(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTournaments();
  }, [isLoggedIn, token]);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  // --- MOBILE: Card List ---
  if (isMobile) {
    return (
      <Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : tournaments.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center" }}>
            No tournaments found.
          </Typography>
        ) : (
          tournaments.map((t) => (
            <Paper key={t._id} sx={{ mb: 2, p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 44,
                    height: 44,
                  }}
                  aria-label={t.sport}
                >
                  {sportIcons[t.sport] || <SportsSoccer />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.organization?.fullName || "N/A"}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Event fontSize="small" />{" "}
                      {t.startDate && t.endDate
                        ? `${formatDate(t.startDate)} to ${formatDate(
                            t.endDate
                          )}`
                        : "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <LocationOn fontSize="small" /> {t.location || "N/A"}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 1 }}
                  >
                    <Group color="primary" fontSize="small" />
                    <Typography variant="body1" fontWeight={500}>
                      {t.participants || "N/A"}
                    </Typography>
                    <StatusChip status={t.status} />
                  </Stack>
                  <Box sx={{ mt: 1 }}>
                    <ProgressWithLabel value={t.progress || 0} />
                  </Box>
                </Box>
              </Stack>
            </Paper>
          ))
        )}
      </Box>
    );
  }

  // --- DESKTOP: Table ---
  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            maxWidth: 1200,
            mx: "auto",
            width: "100%",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: theme.palette.primary.contrastText,
              px: { xs: 2, sm: 4 },
              py: { xs: 3, sm: 4 },
              position: "relative",
            }}
          >
            <Typography variant="h4" fontWeight={700} mb={0.5}>
              Tournament Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.88 }}>
              Manage and track all your tournaments
            </Typography>
          </Box>

          {/* Table */}
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 700 }} aria-label="Tournaments Table">
              <TableHead>
                <TableRow sx={{ background: theme.palette.grey[100] }}>
                  <TableCell sx={{ fontWeight: 700, width: "30%" }}>
                    Tournament
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Details
                  </TableCell>
                  {/* <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Participants
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Progress
                  </TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Alert severity="error">{error}</Alert>
                    </TableCell>
                  </TableRow>
                ) : tournaments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography>No tournaments found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tournaments.map((t) => (
                    <TableRow
                      key={t._id}
                      hover
                      sx={{
                        transition: "background 0.2s",
                        "&:nth-of-type(odd)": {
                          background: theme.palette.action.hover,
                        },
                      }}
                    >
                      {/* Tournament & Organizer */}
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 44,
                              height: 44,
                            }}
                            aria-label={t.sport}
                          >
                            {sportIcons[t.sport] || <SportsSoccer />}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {t.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.2 }}
                            >
                              {t.organization?.fullName || "N/A"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center">
                        <StatusChip status={t.status} />
                      </TableCell>

                      {/* Details */}
                      <TableCell align="center">
                        <Stack spacing={1} alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Event fontSize="small" sx={{ mr: 0.5 }} />
                            {t.startDate && t.endDate
                              ? `${formatDate(t.startDate)} to ${formatDate(
                                  t.endDate
                                )}`
                              : "N/A"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                            {t.location || "N/A"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Participants */}
                      {/* <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Group color="primary" fontSize="small" />
                          <Typography variant="body1" fontWeight={500}>
                            {t.participants || "N/A"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Progress 
                      <TableCell align="center">
                        <ProgressWithLabel value={t.progress || 0} />
                      </TableCell> */}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Box
            sx={{
              px: { xs: 2, sm: 4 },
              py: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              background: theme.palette.background.paper,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Showing {tournaments.length} of {tournaments.length} tournaments
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
