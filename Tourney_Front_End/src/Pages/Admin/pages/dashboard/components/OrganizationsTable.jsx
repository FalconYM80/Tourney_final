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
  Divider,
  styled,
  Stack,
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
  Event,
  Email,
  MoreVert,
  CheckCircle,
  Pending,
  Group,
  Refresh,
  AdminPanelSettings,
  Cancel,
  VerifiedUser,
  HourglassEmpty,
  ThumbUp,
  ThumbDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../../../../Contexts/AdminContext/AdminContext";

const API_BASE_URL = "http://localhost:8000";

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

const OrganizationsTable = () => {
  // Context
  const { token, admin, isLoggedIn } = useContext(AdminContext);

  // State
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [verificationStats, setVerificationStats] = useState({});

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [adminVerificationFilter, setAdminVerificationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [currentPage, setCurrentPage] = useState(1);

  // UI State
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    orgId: null,
    orgName: "",
  });
  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    orgId: null,
    orgName: "",
    action: "approve", // "approve" or "revoke"
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

  // Fetch Organizations
  const fetchOrganizations = async () => {
    if (!isLoggedIn || !token) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(adminVerificationFilter !== "all" && {
          adminVerified:
            adminVerificationFilter === "verified" ? "true" : "false",
        }),
        isAccountVerified: "true", // Only fetch organizations with verified email
      });

      const response = await apiRequest(`/admin/organizers?${params}`);

      setOrganizations(response.data);
      setPagination(response.pagination);
      setVerificationStats(response.verificationStats || {});
    } catch (error) {
      setError(error.message);
      showSnackbar("Failed to fetch organizations: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete Organization
  const handleDeleteOrganization = async (orgId) => {
    try {
      setLoading(true);
      await apiRequest(`/admin/organizers/${orgId}`, {
        method: "DELETE",
      });

      showSnackbar("Organization deleted successfully", "success");
      setDeleteDialog({ open: false, orgId: null, orgName: "" });
      fetchOrganizations();
    } catch (error) {
      showSnackbar("Failed to delete organization: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Email Verification (optional: you may want to remove this if only verified orgs are shown)
  const handleEmailVerification = async (orgId) => {
    try {
      setLoading(true);
      await apiRequest(`/admin/organizers/${orgId}/verify`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      showSnackbar("Email verified successfully", "success");
      fetchOrganizations();
    } catch (error) {
      showSnackbar("Failed to verify email: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Admin Approval
  const handleAdminApproval = async (orgId, action) => {
    try {
      setLoading(true);
      const endpoint =
        action === "approve"
          ? `/admin/organizers/${orgId}/approve`
          : `/admin/organizers/${orgId}/revoke-approval`;

      await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({}),
      });

      const message =
        action === "approve"
          ? "Organization approved by admin"
          : "Admin approval revoked";

      showSnackbar(message, "success");
      setApprovalDialog({
        open: false,
        orgId: null,
        orgName: "",
        action: "approve",
      });
      fetchOrganizations();
    } catch (error) {
      showSnackbar(`Failed to ${action}: ` + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Utility Functions
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
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

  // const formatEvents = (events) => {
  //   if (!events) return [];
  //   if (Array.isArray(events)) return events;
  //   if (typeof events === "object" && events.name) return [events.name];
  //   return [events.toString()];
  // };

  const formatEvents = (events) => {
  if (!events) return [];
  if (Array.isArray(events)) {
    // If array of objects, map to their names
    return events.map(e => typeof e === "object" && e.name ? e.name : e.toString());
  }
  if (typeof events === "object" && events.name) return [events.name];
  return [events.toString()];
};




  const getMemberAccessCount = (memberAccess) => {
    if (!memberAccess) return 0;
    if (Array.isArray(memberAccess)) return memberAccess.length;
    return 1;
  };

  // Get verification status for display
  const getVerificationStatus = (org) => {
    const emailVerified = org.isAccountVerified;
    const adminVerified = org.isVerifiedByAdmin;

    if (emailVerified && adminVerified) {
      return {
        status: "fully-verified",
        label: "Fully Verified",
        color: "success",
      };
    } else if (emailVerified && !adminVerified) {
      return {
        status: "pending-admin",
        label: "Pending Admin",
        color: "warning",
      };
    } else if (!emailVerified && adminVerified) {
      return { status: "admin-only", label: "Admin Approved", color: "info" };
    } else {
      return { status: "unverified", label: "Unverified", color: "error" };
    }
  };

  // Effects
  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line
  }, [
    currentPage,
    searchTerm,
    adminVerificationFilter,
    sortBy,
    isLoggedIn,
    token,
  ]);

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchOrganizations();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
    // eslint-disable-next-line
  }, [searchTerm]);

  // Render loading state
  if (!isLoggedIn) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Please log in to access organizations
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
                Organizations Management
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  opacity: 0.9,
                  fontWeight: 400,
                }}
              >
                Manage and monitor {pagination.totalItems} registered
                organizations
              </Typography>

              {/* Verification Stats */}
              {verificationStats.totalOrganizers && (
                <Stack direction="row" spacing={3} sx={{ mt: 2, opacity: 0.9 }}>
                  <Typography variant="caption">
                    📧 Email Verified: {verificationStats.emailVerified || 0}
                  </Typography>
                  <Typography variant="caption">
                    👤 Admin Verified: {verificationStats.adminVerified || 0}
                  </Typography>
                  <Typography variant="caption">
                    ⏳ Pending Admin:{" "}
                    {verificationStats.pendingAdminApproval || 0}
                  </Typography>
                </Stack>
              )}
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchOrganizations}
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
                  showSnackbar("Add organization feature coming soon!", "info");
                }}
              >
                Add Organization
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
              placeholder="Search organizations, emails..."
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

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Admin Verification</InputLabel>
              <Select
                value={adminVerificationFilter}
                onChange={(e) => setAdminVerificationFilter(e.target.value)}
                label="Admin Verification"
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "white",
                }}
              >
                <MenuItem value="all">All Admin Status</MenuItem>
                <MenuItem value="verified">👤 Admin Approved</MenuItem>
                <MenuItem value="unverified">⏳ Admin Pending</MenuItem>
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
                <MenuItem value="updatedAt">Recently Updated</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
            <Button size="small" onClick={fetchOrganizations} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2, mt: 0.5 }}>
              Loading organizations...
            </Typography>
          </Box>
        )}

        {/* Enhanced Table Section */}
        <TableContainer sx={{ maxHeight: "70vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ minWidth: 280 }}>
                  Organization
                </StyledTableCell>
                <StyledTableCell sx={{ minWidth: 220 }}>
                  Contact Details
                </StyledTableCell>
                <StyledTableCell sx={{ minWidth: 200 }}>
                  Tournament
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ minWidth: 150 }}>
                  Events
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ minWidth: 120 }}>
                  Team Size
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ minWidth: 200 }}>
                  Verification Status
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ minWidth: 180 }}>
                  Actions
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizations.map((org, index) => {
                const verificationStatus = getVerificationStatus(org);

                return (
                  <StyledTableRow
                    key={org._id}
                    component={motion.tr}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {/* Organization Column */}
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "primary.main",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(org.fullName)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              lineHeight: 1.2,
                              mb: 0.5,
                            }}
                            noWrap
                          >
                            {org.fullName}
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
                            <Event fontSize="inherit" />
                            Joined {formatDate(org.createdAt)}
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
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={org.email}
                          >
                            {org.email}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Updated: {formatDate(org.updatedAt)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Tournament Column */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          lineHeight: 1.3,
                          maxWidth: 180,
                        }}
                      >
                        {org.tournament?.name || "No tournament assigned"}
                      </Typography>
                    </TableCell>

                    {/* Events Column */}
                    <TableCell align="center">
                      <Stack spacing={0.5} alignItems="center">
                        {formatEvents(org.events)
                          .slice(0, 2)
                          .map((event, i) => (
                            <Chip
                              key={i}
                              label={event}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: "0.75rem",
                                height: 24,
                                borderRadius: "12px",
                                maxWidth: 120,
                                "& .MuiChip-label": {
                                  px: 1,
                                },
                              }}
                            />
                          ))}
                        {formatEvents(org.events).length > 2 && (
                          <Tooltip
                            title={formatEvents(org.events).slice(2).join(", ")}
                          >
                            <Chip
                              label={`+${formatEvents(org.events).length - 2}`}
                              size="small"
                              sx={{
                                fontSize: "0.75rem",
                                height: 24,
                                backgroundColor: "action.selected",
                              }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Team Size Column */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2,
                          py: 1,
                          borderRadius: "20px",
                          backgroundColor: "primary.light",
                          color: "primary.contrastText",
                        }}
                      >
                        <Group fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {getMemberAccessCount(org.memberAccess)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Enhanced Verification Status Column */}
                    <TableCell align="center">
                      <Stack spacing={1} alignItems="center">
                        {/* Overall Status */}
                        <Chip
                          label={verificationStatus.label}
                          color={verificationStatus.color}
                          size="small"
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />

                        {/* Individual Status Indicators */}
                        <Stack direction="row" spacing={1}>
                          {/* Email Verification */}
                          <Tooltip
                            title={`Email ${
                              org.isAccountVerified ? "Verified" : "Pending"
                            }`}
                          >
                            <Chip
                              icon={
                                org.isAccountVerified ? (
                                  <VerifiedUser />
                                ) : (
                                  <HourglassEmpty />
                                )
                              }
                              label="Email"
                              size="small"
                              color={
                                org.isAccountVerified ? "success" : "warning"
                              }
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                              onClick={() =>
                                !org.isAccountVerified &&
                                handleEmailVerification(org._id)
                              }
                              style={{
                                cursor: !org.isAccountVerified
                                  ? "pointer"
                                  : "default",
                              }}
                            />
                          </Tooltip>

                          {/* Admin Verification */}
                          <Tooltip
                            title={`Admin ${
                              org.isVerifiedByAdmin ? "Approved" : "Pending"
                            }`}
                          >
                            <Chip
                              icon={
                                org.isVerifiedByAdmin ? (
                                  <AdminPanelSettings />
                                ) : (
                                  <Pending />
                                )
                              }
                              label="Admin"
                              size="small"
                              color={
                                org.isVerifiedByAdmin ? "primary" : "warning"
                              }
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </TableCell>

                    {/* Enhanced Actions Column */}
                    <TableCell align="center">
                      <Stack spacing={1} alignItems="center">
                        {/* Main Actions */}
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="center"
                        >
                          <Tooltip title="View Details">
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
                                  "View details feature coming soon!",
                                  "info"
                                );
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
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
                                  "Edit feature coming soon!",
                                  "info"
                                );
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
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
                                  orgId: org._id,
                                  orgName: org.fullName,
                                });
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        {/* Admin Approval Actions */}
                        <Stack direction="row" spacing={0.5}>
                          {!org.isVerifiedByAdmin && org.isAccountVerified && (
                            <Tooltip title="Approve by Admin">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setApprovalDialog({
                                    open: true,
                                    orgId: org._id,
                                    orgName: org.fullName,
                                    action: "approve",
                                  });
                                }}
                                sx={{ fontSize: "0.8rem" }}
                              >
                                <ThumbUp fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {org.isVerifiedByAdmin && (
                            <Tooltip title="Revoke Admin Approval">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setApprovalDialog({
                                    open: true,
                                    orgId: org._id,
                                    orgName: org.fullName,
                                    action: "revoke",
                                  });
                                }}
                                sx={{ fontSize: "0.8rem" }}
                              >
                                <ThumbDown fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                    </TableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Empty State */}
        {!loading && organizations.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No organizations found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || adminVerificationFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first organization"}
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
            Showing <strong>{organizations.length}</strong> of{" "}
            <strong>{pagination.totalItems}</strong> organizations
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
          setDeleteDialog({ open: false, orgId: null, orgName: "" })
        }
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.orgName}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialog({ open: false, orgId: null, orgName: "" })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteOrganization(deleteDialog.orgId)}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialog.open}
        onClose={() =>
          setApprovalDialog({
            open: false,
            orgId: null,
            orgName: "",
            action: "approve",
          })
        }
      >
        <DialogTitle>
          {approvalDialog.action === "approve"
            ? "Confirm Admin Approval"
            : "Confirm Revoke Approval"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {approvalDialog.action === "approve"
              ? "approve"
              : "revoke approval for"}{" "}
            "{approvalDialog.orgName}"{" "}
            {approvalDialog.action === "approve" ? "by admin" : ""}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setApprovalDialog({
                open: false,
                orgId: null,
                orgName: "",
                action: "approve",
              })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleAdminApproval(approvalDialog.orgId, approvalDialog.action)
            }
            color={approvalDialog.action === "approve" ? "success" : "error"}
            variant="contained"
            disabled={loading}
          >
            {approvalDialog.action === "approve" ? "Approve" : "Revoke"}
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

export default OrganizationsTable;
