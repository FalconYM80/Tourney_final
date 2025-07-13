import express from 'express';
const router = express.Router();


import { signUp,verifyEmailWithOTP,login, checkPlayerAuthorization, getCurrentPlayer, logOut, getAllPublicTournaments, getTournamentEvents, getTournamentById, getAllOrganizationsPublic, getTournamentsByOrganization, getEventFixtures, updateFixtureScore, searchFixtureByTeams } from '../../Controllers/Players/PlayerController.js';

import { userAuthMiddleware } from '../../Middlewares/jwtAuth.js';



router.post('/signup',signUp);
router.post('/verifyEmailWithOTP',verifyEmailWithOTP);
router.post('/login',login);
router.post('/logout', userAuthMiddleware,logOut);
router.get('/checkAuth',userAuthMiddleware,checkPlayerAuthorization);
router.get('/getPlayerDetails',userAuthMiddleware, getCurrentPlayer);

router.get('/tournaments/public', getAllPublicTournaments);
router.get('/tournaments/:id', getTournamentById);
router.get('/tournaments/:id/events', getTournamentEvents);






// Public: Get all organizations (for player)
router.get('/organizations/public', getAllOrganizationsPublic);

// Public: Get tournaments by organization
router.get('/organizations/:id/tournaments', getTournamentsByOrganization);

// Public: Get fixtures for an event
router.get('/events/:id/fixtures', getEventFixtures);

// GET search fixture by team names
router.get('/fixtures/search', searchFixtureByTeams);

// PATCH: Update fixture score
router.patch('/fixtures/:fixtureId', updateFixtureScore);

export default router;