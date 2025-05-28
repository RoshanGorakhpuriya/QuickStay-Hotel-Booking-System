import express from "express";
import { checkAvailabilityAPI, createBooking, getHotelBookings, getUserBookings } from
 "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityAPI )

bookingRouter.post('/book',protect ,createBooking )

bookingRouter.post('/user', protect , getUserBookings )

bookingRouter.post('/hotel', protect , getHotelBookings )

export default bookingRouter;