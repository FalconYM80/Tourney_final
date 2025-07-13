import mongoose from "mongoose";

const FixtureSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tournament",
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
    },
    round: {
      type: Number,
      required: true,
    },
    roundName: String,
    matchIndex: {
      type: Number,
      required: true,
    },
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      default: null,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      default: null,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    scoreA: Number,
    scoreB: Number,
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
    },
    notes: String,
  },
  { timestamps: true }
);

const Fixture = mongoose.model("fixture", FixtureSchema);

export default Fixture;
