import express from "express";
import adminController from "../../Controllers/Admin/AdminController.js";
import {
  verifyAdminToken,
  logAdminActivity,
} from "../../Middlewares/authMiddleware.js";

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(verifyAdminToken);
router.use(logAdminActivity);

// ==================== DASHBOARD ROUTES ====================
router.get("/dashboard", adminController.getDashboardOverview);

// ==================== TOTAL COUNTS ROUTES ====================
router.get("/total-organizations", adminController.getTotalOrganizations);
router.get("/total-tournaments", adminController.getTotalTournaments);
router.get("/total-events", adminController.getTotalEvents);
router.get("/total-players", adminController.getTotalPlayers);

// ==================== ORGANIZER ROUTES ====================
router.post("/organizers", adminController.createOrganizer);
router.get("/organizers", adminController.getAllOrganizers);

// ⚠️ IMPORTANT: Put specific routes BEFORE parameterized routes
router.get(
  "/organizers/pending-approvals",
  adminController.getPendingAdminApprovals
);

router.get("/organizers/:id", adminController.getOrganizerById);
router.put("/organizers/:id", adminController.updateOrganizer);
router.delete("/organizers/:id", adminController.deleteOrganizer);

// Email verification route
router.post("/organizers/:id/verify", adminController.verifyOrganizerAccount);

// NEW: Admin approval routes
router.post("/organizers/:id/approve", adminController.approveOrganizerByAdmin);
router.post(
  "/organizers/:id/revoke-approval",
  adminController.revokeAdminApproval
);

// ==================== PLAYER ROUTES ====================
router.post("/players", adminController.createPlayer);
router.get("/players", adminController.getAllPlayers);

// ⚠️ IMPORTANT: Put stats route BEFORE parameterized routes
router.get("/players/stats", adminController.getPlayerStats);

router.get("/players/:id", adminController.getPlayerById);
router.put("/players/:id", adminController.updatePlayer);
router.delete("/players/:id", adminController.deletePlayer);

// ==================== TOURNAMENT ROUTES ====================
router.get("/tournaments", adminController.getAllTournaments);
router.get("/tournaments/:id", adminController.getTournamentById);
router.post("/tournaments/:id/approve", adminController.approveTournament);
router.post("/tournaments/:id/reject", adminController.rejectTournament);
router.delete("/tournaments/:id", adminController.deleteTournament);

export default router;
