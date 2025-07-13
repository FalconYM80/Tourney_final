import { useState, useEffect, useContext } from "react";
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
  TextField,
  InputAdornment,
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { AdminContext } from "../../../../../Contexts/AdminContext/AdminContext";

const API_BASE_URL = "http://localhost:8000";

// Only for UI display, never sent to backend
const statusMap = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

const TournamentManagement = () => {
  const { token, isLoggedIn } = useContext(AdminContext);

  const [tabValue, setTabValue] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewDialog, setViewDialog] = useState({
    open: false,
    tournament: null,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    tournament: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // API Service
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // Fetch tournaments
  const fetchTournaments = async () => {
    if (!isLoggedIn || !token) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        ...(tabValue === "approved" && { isVerified: "true" }),
        ...(tabValue === "pending" && { isVerified: "false" }),
        ...(searchInput && { search: searchInput }),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const response = await apiRequest(`/admin/tournaments?${params}`);
      setTournaments(response.data);
    } catch (err) {
      setError(err.message || "Error loading tournaments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
    // eslint-disable-next-line
  }, [tabValue, searchInput, isLoggedIn, token]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleSearchChange = (e) => setSearchInput(e.target.value);
  const handleAction = (action, tournament) =>
    setConfirmDialog({ open: true, action, tournament });

  const handleConfirmAction = async () => {
    if (!confirmDialog.tournament) return;
    setActionLoading(true);
    setError("");
    try {
      let url = `/admin/tournaments/${confirmDialog.tournament._id}`;
      let method = "POST";
      if (confirmDialog.action === "approve") url += "/approve";
      else if (confirmDialog.action === "reject") url += "/reject";
      else if (confirmDialog.action === "delete") method = "DELETE";
      await apiRequest(url, { method });
      setSnackbar({
        open: true,
        message:
          confirmDialog.action === "approve"
            ? "Tournament approved"
            : confirmDialog.action === "reject"
            ? "Tournament rejected"
            : "Tournament deleted",
        severity: "success",
      });
      setConfirmDialog({ open: false, action: null, tournament: null });
      fetchTournaments();
    } catch (err) {
      setError(err.message || "Action failed");
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // UI Filtering
  const filteredTournaments = tournaments.filter((tournament) => {
    // Tab filtering
    if (tabValue === "pending") {
      if (tournament.isVerified) return false;
    }
    if (tabValue === "approved") {
      if (!tournament.isVerified) return false;
    }
    // Search filtering
    const matchesSearch =
      searchInput.trim() === ""
        ? true
        : tournament.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          (tournament.organization?.fullName || "")
            .toLowerCase()
            .includes(searchInput.toLowerCase()) ||
          (tournament.location || "")
            .toLowerCase()
            .includes(searchInput.toLowerCase());
    return matchesSearch;
  });

  if (!isLoggedIn) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Please log in to access tournaments
        </Typography>
      </Box>
    );
  }

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
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tournament Management
      </Typography>

      {/* Search and Tabs */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3, justifyContent: "space-between" }}
      >
        <Box sx={{ flex: 1 }}>
          <TextField
            placeholder="Search by name, organizer, or location..."
            variant="outlined"
            size="small"
            value={searchInput}
            onChange={handleSearchChange}
            InputProps={{
              sx: {
                background: "#fff",
                borderRadius: 2,
                boxShadow: "0 1px 6px rgba(67,97,238,0.06)",
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="search"
                    edge="end"
                    sx={{
                      color: "#4361ee",
                      "&:hover": { background: "#e0e7ff" },
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Box>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            minWidth: { xs: "100%", sm: "auto" },
            "& .MuiTabs-indicator": {
              height: 3,
              backgroundColor: "#4361ee",
            },
          }}
        >
          <Tab label="All" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="Approved" value="approved" />
        </Tabs>
      </Stack>

      {/* Error/Loading */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in timeout={400}>
          <Box>
            {filteredTournaments.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{ mt: 4, textAlign: "center" }}
              >
                No tournaments found.
              </Typography>
            ) : (
              filteredTournaments.map((tournament) => (
                <Card
                  key={tournament._id}
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {tournament.name}
                    </Typography>
                    <Chip
                      label={statusMap[tournament.status] || tournament.status}
                      color={
                        tournament.status === "active" ||
                        tournament.status === "completed"
                          ? "success"
                          : tournament.status === "cancelled"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                    />
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    <strong>Organizer:</strong>{" "}
                    {tournament.organization?.fullName || "N/A"}
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" },
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <DetailItem
                      label="Dates:"
                      value={
                        tournament.startDate && tournament.endDate
                          ? `${new Date(
                              tournament.startDate
                            ).toLocaleDateString()} to ${new Date(
                              tournament.endDate
                            ).toLocaleDateString()}`
                          : "N/A"
                      }
                    />
                    <DetailItem label="Location:" value={tournament.location} />
                    <DetailItem
                      label="Events:"
                      value={tournament.events?.length || 0}
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      sx={{
                        textTransform: "none",
                        borderRadius: "8px",
                      }}
                      onClick={() => setViewDialog({ open: true, tournament })}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ApproveIcon />}
                      sx={{
                        background:
                          "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
                        textTransform: "none",
                        borderRadius: "8px",
                        boxShadow: "none",
                      }}
                      disabled={tournament.isVerified}
                      onClick={() => handleAction("approve", tournament)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<RejectIcon />}
                      sx={{
                        background:
                          "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
                        textTransform: "none",
                        borderRadius: "8px",
                        boxShadow: "none",
                      }}
                      disabled={tournament.status === "cancelled"}
                      onClick={() => handleAction("reject", tournament)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<DeleteIcon />}
                      sx={{
                        background:
                          "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
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
                      onClick={() => handleAction("delete", tournament)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Card>
              ))
            )}
          </Box>
        </Fade>
      )}

      {/* View Tournament Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, tournament: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {viewDialog.tournament?.name || "Tournament Details"}
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.tournament ? (
            <Stack spacing={2}>
              <DetailItem
                label="Organizer"
                value={viewDialog.tournament.organization?.fullName || "N/A"}
              />
              <DetailItem
                label="Sport"
                value={viewDialog.tournament.sport || "N/A"}
              />
              <DetailItem
                label="Dates"
                value={
                  viewDialog.tournament.startDate &&
                  viewDialog.tournament.endDate
                    ? `${new Date(
                        viewDialog.tournament.startDate
                      ).toLocaleDateString()} to ${new Date(
                        viewDialog.tournament.endDate
                      ).toLocaleDateString()}`
                    : "N/A"
                }
              />
              <DetailItem
                label="Location"
                value={viewDialog.tournament.location || "N/A"}
              />
              <DetailItem
                label="Status"
                value={
                  statusMap[viewDialog.tournament.status] ||
                  viewDialog.tournament.status
                }
              />
              <DetailItem
                label="Events"
                value={viewDialog.tournament.events?.length || 0}
              />
              <DetailItem
                label="Description"
                value={viewDialog.tournament.description || "N/A"}
              />
              <DetailItem
                label="Verified"
                value={viewDialog.tournament.isVerified ? "Yes" : "No"}
              />
            </Stack>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewDialog({ open: false, tournament: null })}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, action: null, tournament: null })
        }
      >
        <DialogTitle>
          {confirmDialog.action === "approve"
            ? "Approve Tournament"
            : confirmDialog.action === "reject"
            ? "Reject Tournament"
            : "Delete Tournament"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {confirmDialog.action === "approve"
              ? "approve"
              : confirmDialog.action === "reject"
              ? "reject"
              : "delete"}{" "}
            the tournament <b>{confirmDialog.tournament?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, action: null, tournament: null })
            }
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={
              confirmDialog.action === "approve"
                ? "success"
                : confirmDialog.action === "reject"
                ? "error"
                : "warning"
            }
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={22} />
            ) : confirmDialog.action === "approve" ? (
              "Approve"
            ) : confirmDialog.action === "reject" ? (
              "Reject"
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

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
