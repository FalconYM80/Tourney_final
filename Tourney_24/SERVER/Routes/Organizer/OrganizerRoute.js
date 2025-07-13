import express from "express";

const router = express.Router();

import {
  signUp,
  verifyEmailWithOTP,
  login,
  createTournament,
  getAllTournaments,
  getParticularTournament,
  getCurrentOrganizer,
  checkOrganizerAuthorization,
  logOut,
  createNewEvent,
  getAllEvents,
  createIndividual,
  createGroupTeam,
  getIndividualTeam,
  getGroupTeam,
  getPaymentDetails,
  addSettings,
  sendMassMail,
  updateTournamentStatus,
  getDashBoardData,
  getProfile,
  getDashboardStats,
  addMember,
  getOrganizationMembers,
  getAccessibleOrganizations,
  switchOrganization,
  createOrganization,
  getCurrentOrganization,
  getEventFixtures,
  updateFixtureScores,
  resetFixtureScores,
} from "../../Controllers/Organizers/OrganizerController.js";
import fixturesRoutes from "./fixturesRoutes.js";
import { deleteTeam } from "../../Controllers/Organizers/TeamsController.js";

import { organizerAuthMidlleware } from "../../Middlewares/jwtAuth.js";

router.post("/signup", signUp);
router.post("/verifyEmailWithOTP", verifyEmailWithOTP);
router.post("/login", login);
router.post("/logout", organizerAuthMidlleware, logOut);
router.get("/checkAuth", organizerAuthMidlleware, checkOrganizerAuthorization);
router.get(
  "/getOrganizerDetails",
  organizerAuthMidlleware,
  getCurrentOrganizer
);
router.post("/createTournament", organizerAuthMidlleware, createTournament);
router.get("/getAllTournaments", organizerAuthMidlleware, getAllTournaments);
router.get(
  "/getParticularTournament/:id",
  organizerAuthMidlleware,
  getParticularTournament
);
router.post("/createEvent/:id", organizerAuthMidlleware, createNewEvent);
router.get("/allEvents/:TournamentId", organizerAuthMidlleware, getAllEvents);
router.post(
  "/createIndividualTeam/:TournamentId/:eventId",
  organizerAuthMidlleware,
  createIndividual
);
router.post(
  "/createGroupTeam/:TournamentId/:eventId",
  organizerAuthMidlleware,
  createGroupTeam
);
router.get(
  "/getIndividualTeam/:TournamentId/:eventId",
  organizerAuthMidlleware,
  getIndividualTeam
);
router.get(
  "/getGroupTeam/:TournamentId/:eventId",
  organizerAuthMidlleware,
  getGroupTeam
);
router.get(
  "/getPaymentDetails/:TournamentId",
  organizerAuthMidlleware,
  getPaymentDetails
);
router.post(
  "/changeSettings/:TournamentId",
  organizerAuthMidlleware,
  addSettings
);
router.post(
  "/sendMassMail/:TournamentId",
  organizerAuthMidlleware,
  sendMassMail
);

router.get("/updateTournamentStatus", updateTournamentStatus);
router.get("/dashboard", organizerAuthMidlleware, getDashBoardData);

// delete team
router.delete("/teams/:teamId", organizerAuthMidlleware, deleteTeam);

// Organization management routes
router.get("/profile", organizerAuthMidlleware, getProfile);
router.get("/dashboard-stats", organizerAuthMidlleware, getDashboardStats);
router.post("/add-member", organizerAuthMidlleware, addMember);
router.get("/members", organizerAuthMidlleware, getOrganizationMembers);
router.get(
  "/accessible-organizations",
  organizerAuthMidlleware,
  getAccessibleOrganizations
);
router.get(
  "/current-organization",
  organizerAuthMidlleware,
  getCurrentOrganization
);
router.post(
  "/switch-organization",
  organizerAuthMidlleware,
  switchOrganization
);
router.post(
  "/create-organization",
  organizerAuthMidlleware,
  createOrganization
);

router.use("/fixtures", fixturesRoutes);

router.get('/allMatches/:TournamentId/:eventId',organizerAuthMidlleware, getEventFixtures);


router.patch('/update-scores/:fixtureId', organizerAuthMidlleware, updateFixtureScores);
router.patch('/reset-scores/:fixtureId', organizerAuthMidlleware, resetFixtureScores);

export default router;
