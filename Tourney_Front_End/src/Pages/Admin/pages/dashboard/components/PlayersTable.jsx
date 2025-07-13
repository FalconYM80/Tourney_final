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
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Button,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  styled,
  Stack,
  LinearProgress,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  SportsSoccer,
  SportsTennis,
  SportsBasketball,
  SportsVolleyball,
  Email,
  Phone,
  Cake,
  Person,
  EmojiEvents,
  MoreVert,
  Refresh,
  Analytics,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../../../../Contexts/AdminContext/AdminContext";

const API_BASE_URL = "http://localhost:8000";

const statusColors = {
  active: "success",
  inactive: "error",
  pending: "warning",
};

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "scale(1.002)",
    transition: "all 0.2s ease-in-out",
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.action.selected,
  },
  "& td": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.grey[50],
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  padding: theme.spacing(2),
  whiteSpace: "nowrap",
}));

const PlayersTable = () => {
  // Context
  const { token, admin, isLoggedIn } = useContext(AdminContext);
  // For Aadhaar Image Modal
  const [aadhaarModal, setAadhaarModal] = useState({
    open: false,
    imageUrl: "",
  });

  // State
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [currentPage, setCurrentPage] = useState(1);

  // UI State
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    playerId: null,
    playerName: "",
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

  // Fetch Players
  const fetchPlayers = async () => {
    if (!isLoggedIn || !token) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        sortBy,
        sortOrder: "desc",
        ...(searchTerm && { search: searchTerm }),
        ...(ageFilter !== "all" && {
          ...(ageFilter === "youth" && { ageMax: 18 }),
          ...(ageFilter === "adult" && { ageMin: 18, ageMax: 35 }),
          ...(ageFilter === "senior" && { ageMin: 35 }),
        }),
      });

      const response = await apiRequest(`/admin/players?${params}`);

      setPlayers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.message);
      showSnackbar("Failed to fetch players: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete Player
  const handleDeletePlayer = async (playerId) => {
    try {
      setLoading(true);
      await apiRequest(`/admin/players/${playerId}`, {
        method: "DELETE",
      });

      showSnackbar("Player deleted successfully", "success");
      setDeleteDialog({ open: false, playerId: null, playerName: "" });
      fetchPlayers();
    } catch (error) {
      showSnackbar("Failed to delete player: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Utility Functions
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getSportIcon = (tournament) => {
    if (!tournament) return <SportsBasketball fontSize="small" />;
    const tournamentName =
      typeof tournament === "object" ? tournament.name : tournament;
    if (tournamentName?.includes("Badminton"))
      return <SportsTennis fontSize="small" />;
    if (tournamentName?.includes("Football"))
      return <SportsSoccer fontSize="small" />;
    if (tournamentName?.includes("Volleyball"))
      return <SportsVolleyball fontSize="small" />;
    return <SportsBasketball fontSize="small" />;
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    return Math.floor(
      (new Date() - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 365)
    );
  };

  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  };

  const getAgeCategory = (birthDate) => {
    const age = calculateAge(birthDate);
    if (age === "N/A") return "Unknown";
    if (age < 18) return "Youth";
    if (age < 35) return "Adult";
    return "Senior";
  };

  const getPerformanceColor = (wins, matches) => {
    if (matches === 0) return "grey.400";
    const winRate = wins / matches;
    if (winRate > 0.7) return "success.main";
    if (winRate > 0.4) return "warning.main";
    return "error.main";
  };

  // Effects
  useEffect(() => {
    fetchPlayers();
  }, [currentPage, searchTerm, ageFilter, sortBy, isLoggedIn, token]);

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchPlayers();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Render loading state
  if (!isLoggedIn) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Please log in to access players
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedPaper elevation={0}>
        {/* Header Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 4,
            position: "relative",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  mb: 1,
                }}
              >
                Players Management
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  opacity: 0.9,
                  fontWeight: 400,
                }}
              >
                Manage and monitor {pagination.totalItems} registered players
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                onClick={() => {
                  showSnackbar(
                    "Player statistics feature coming soon!",
                    "info"
                  );
                }}
                sx={{
                  borderRadius: "12px",
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.5)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Statistics
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchPlayers}
                disabled={loading}
                sx={{
                  borderRadius: "12px",
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.5)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  borderRadius: "12px",
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.3)",
                  },
                }}
                onClick={() => {
                  showSnackbar("Add player feature coming soon!", "info");
                }}
              >
                Add New Player
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Enhanced Filters Section */}
        <Box sx={{ p: 3, backgroundColor: "grey.50" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="stretch"
          >
            <TextField
              variant="outlined"
              placeholder="Search players, emails, phones..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 300,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "white",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Age Category</InputLabel>
              <Select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                label="Age Category"
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "white",
                }}
              >
                <MenuItem value="all">All Ages</MenuItem>
                <MenuItem value="youth">🧒 Youth (Under 18)</MenuItem>
                <MenuItem value="adult">👨 Adult (18-35)</MenuItem>
                <MenuItem value="senior">🧓 Senior (35+)</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "white",
                }}
              >
                <MenuItem value="createdAt">Recently Added</MenuItem>
                <MenuItem value="fullName">Name (A-Z)</MenuItem>
                <MenuItem value="DateOfBirth">Age (Youngest)</MenuItem>
                <MenuItem value="updatedAt">Recently Updated</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
            <Button size="small" onClick={fetchPlayers} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2, mt: 0.5 }}>
              Loading players...
            </Typography>
          </Box>
        )}

        {/* Table Section */}
        <TableContainer sx={{ maxHeight: "70vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ minWidth: 300 }}>Player</StyledTableCell>
                <StyledTableCell sx={{ minWidth: 250 }}>
                  Contact Details
                </StyledTableCell>
                <StyledTableCell sx={{ minWidth: 220 }}>
                  Tournament & Events
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ minWidth: 120 }}>
                  Age Category
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ minWidth: 150 }}>
                  Aadhaar Image
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ minWidth: 180 }}>
                  Performance
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ minWidth: 120 }}>
                  Actions
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((player, index) => (
                <StyledTableRow
                  key={player._id}
                  component={motion.tr}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Player Column */}
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Badge
                        overlap="circular"
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        badgeContent={
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "primary.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              border: "2px solid white",
                            }}
                          >
                            {getSportIcon(player.tournament)}
                          </Box>
                        }
                      >
                        <Avatar
                          src={player.avatar}
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: "primary.main",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(player.fullName)}
                        </Avatar>
                      </Badge>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            lineHeight: 1.2,
                            mb: 0.5,
                          }}
                        >
                          {player.fullName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Cake fontSize="inherit" />
                          {player.age || calculateAge(player.DateOfBirth)} years
                          • Joined {formatDate(player.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Contact Column */}
                  <TableCell>
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Email fontSize="small" color="action" />
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={player.email}
                        >
                          {player.email}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">
                          +91 {formatPhone(player.phone)}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Tournament & Events Column */}
                  <TableCell>
                    <Stack spacing={1}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          lineHeight: 1.3,
                          maxWidth: 200,
                        }}
                      >
                        {player.tournament?.name || "No tournament assigned"}
                      </Typography>
                      <Chip
                        label={player.events?.name || "No event assigned"}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.75rem",
                          height: 24,
                          borderRadius: "12px",
                          width: "fit-content",
                        }}
                      />
                    </Stack>
                  </TableCell>

                  {/* Age Category Column */}
                  <TableCell align="center">
                    <Chip
                      label={getAgeCategory(player.DateOfBirth)}
                      size="small"
                      color={
                        getAgeCategory(player.DateOfBirth) === "Youth"
                          ? "info"
                          : getAgeCategory(player.DateOfBirth) === "Adult"
                          ? "primary"
                          : "secondary"
                      }
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  {/* Aadhaar Image */}
                  <TableCell align="center">
                    {player.aadhaarImage ? (
                      <Tooltip title="Click to enlarge" arrow>
                        <Box
                          component="img"
                          src={player.aadhaarImage}
                          sx={{
                            width: 80,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 1,
                            cursor: "pointer",
                            transition: "transform 0.2s",
                            "&:hover": {
                              transform: "scale(1.2)",
                              zIndex: 1,
                              boxShadow: 3,
                            },
                          }}
                          onClick={() =>
                            setAadhaarModal({
                              open: true,
                              imageUrl: player.aadhaarImage,
                            })
                          }
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Not uploaded
                      </Typography>
                    )}
                  </TableCell>

                  {/* Performance Column - Note: Mock data since backend doesn't have matches/wins */}
                  <TableCell align="center">
                    <Box sx={{ width: "100%" }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ mb: 1 }}
                      >
                        <EmojiEvents fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={600}>
                          Coming Soon
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "grey.200",
                          mb: 0.5,
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            backgroundColor: "grey.400",
                          },
                        }}
                      />

                      <Typography variant="caption" color="text.secondary">
                        Stats tracking soon
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <Tooltip title="View Profile">
                        <IconButton
                          size="small"
                          color="primary"
                          sx={{
                            "&:hover": {
                              backgroundColor: "primary.light",
                              color: "primary.contrastText",
                            },
                          }}
                          onClick={() => {
                            showSnackbar(
                              "View profile feature coming soon!",
                              "info"
                            );
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Player">
                        <IconButton
                          size="small"
                          color="secondary"
                          sx={{
                            "&:hover": {
                              backgroundColor: "secondary.light",
                              color: "secondary.contrastText",
                            },
                          }}
                          onClick={() => {
                            showSnackbar(
                              "Edit player feature coming soon!",
                              "info"
                            );
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Player">
                        <IconButton
                          size="small"
                          color="error"
                          sx={{
                            "&:hover": {
                              backgroundColor: "error.light",
                              color: "error.contrastText",
                            },
                          }}
                          onClick={() => {
                            setDeleteDialog({
                              open: true,
                              playerId: player._id,
                              playerName: player.fullName,
                            });
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Empty State */}
        {!loading && players.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No players found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || ageFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first player"}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Divider />
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "grey.50",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{players.length}</strong> of{" "}
            <strong>{pagination.totalItems}</strong> players
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Typography
              variant="body2"
              sx={{
                px: 2,
                py: 1,
                alignSelf: "center",
                bgcolor: "primary.light",
                borderRadius: 1,
                color: "primary.contrastText",
              }}
            >
              {currentPage} of {pagination.totalPages}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage >= pagination.totalPages || loading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </Stack>
        </Box>
      </AnimatedPaper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, playerId: null, playerName: "" })
        }
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.playerName}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialog({ open: false, playerId: null, playerName: "" })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeletePlayer(deleteDialog.playerId)}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={aadhaarModal.open}
        onClose={() => setAadhaarModal({ open: false, imageUrl: "" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Aadhaar Image</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f9f9f9",
            p: 3,
          }}
        >
          <Box
            component="img"
            src={aadhaarModal.imageUrl}
            alt="Aadhaar"
            sx={{
              width: "100%",
              maxWidth: 400,
              maxHeight: 400,
              objectFit: "contain",
              borderRadius: 2,
              boxShadow: 4,
              border: "1px solid #eee",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAadhaarModal({ open: false, imageUrl: "" })}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </motion.div>
  );
};

export default PlayersTable;
