import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'player',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'event',
    required: true,
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tournament',
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  bookingType:{
    type:String,
    enum:['online','offline'],
  }
});

const BookingModel = mongoose.model('booking', BookingSchema);

export default BookingModel;
