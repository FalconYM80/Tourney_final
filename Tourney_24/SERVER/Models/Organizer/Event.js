import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  eventType: {
    type: String,
    enum: ["singles", "doubles"],
    required: true,
  },
  matchType: {
    type: String,
    enum: ["knockout", "round-robin", "round-robin-knockout"],
    required: true,
  },
  maxTeams: {
    type: Number,
    required: true,
  },
  entryFee: {
    type: Number,
    required: true,
  },
  allowBooking: {
    type: Boolean,
    default: true,
  },
  offers: {
    type: Number,
    default: 0,
  },
  numberOfParticipants: {
    type: Number,
    default: 0,
  },
  eventType2: {
    type: String,
    enum: ["individual", "group"],
    required: true,
  },

  participantsIndividual: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teamIndividual",
    },
  ],
  participantsGroup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teamGroup",
    },
  ],
  //   fixtures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fixture' }]
});

const Events = mongoose.model("event", EventSchema);

export default Events;
