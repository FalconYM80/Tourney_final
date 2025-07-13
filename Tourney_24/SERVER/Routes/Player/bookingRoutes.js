import express from 'express';
// import { createBooking, getAllBookings } from '../../Controllers/Player/BookingController.js';

import { createBooking, getAllBookings } from '../../Controllers/Players/BookingController.js';

import { userAuthMiddleware } from '../../Middlewares/jwtAuth.js';

const router = express.Router();

router.post('/book', userAuthMiddleware, createBooking);
router.get('/all', userAuthMiddleware, getAllBookings);

export default router;
