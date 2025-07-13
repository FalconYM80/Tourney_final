import BookingModel from '../../Models/Player/BookingModel.js';

const createBooking = async (req, res) => {
  try {
    const playerId = req.user;
    const { eventId, tournamentId } = req.body;

    if (!eventId || !tournamentId) {
      return res.json({ success: false, message: "Event and Tournament ID are required" });
    }

    // Optional: Prevent duplicate booking
    const existing = await BookingModel.findOne({ player: playerId, event: eventId });
    if (existing) {
      return res.json({ success: false, message: "You have already booked this event" });
    }

    const newBooking = await BookingModel.create({
      player: playerId,
      event: eventId,
      tournament: tournamentId,
    });

    return res.json({ success: true, message: "Booking successful", data: newBooking });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.json({ success: false, message: "Something went wrong while booking" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const playerId = req.user;

    const bookings = await BookingModel.find({ player: playerId })
      .populate('event')
      .populate('tournament');

    return res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.json({ success: false, message: "Could not fetch bookings" });
  }
};

export { createBooking, getAllBookings };
