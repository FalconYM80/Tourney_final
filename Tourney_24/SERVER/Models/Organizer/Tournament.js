import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
    sport: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Active", "Completed", "cancelled"],
      default: "Upcoming",
    },
    // isPublic: {
    //     type: Boolean,
    //     default: true
    // },
    isVerified: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizer",
      required: true,
    },
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event",
      },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team",
      },
    ],
    // settings: {
    //     name:String,
    //     url: String,
    //     otp: String,
    //     seedingOptionInFixtures: Boolean,
    //     askEmailFromPlayer: Boolean,
    //     askMobileFromPlayer: Boolean,
    //     askAdditionalInfo: Boolean,
    //     showFixtures: Boolean,
    //     customFields: [{
    //         fieldName: String,
    //         hintText: String,
    //         isMandatory: Boolean,
    //         displayInFixture: Boolean
    //     }]
    // },

    settings: {
      url: { type: String, default: null },
      otp: { type: String, default: "983620" },
      seedingOptionInFixtures: { type: Boolean, default: false },
      askEmailFromPlayer: { type: Boolean, default: true },
      askMobileFromPlayer: { type: Boolean, default: true },
      askAdditionalInfo: { type: Boolean, default: true },
      showFixtures: { type: Boolean, default: true },
      customFields: [
        {
          fieldName: String,
          hintText: String,
          isMandatory: Boolean,
          displayInFixture: Boolean,
        },
      ],
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
    // totalPlayers:{
    //     type:Number,
    //     required:true
    // },
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Tournament = mongoose.model("tournament", TournamentSchema);

export default Tournament;
