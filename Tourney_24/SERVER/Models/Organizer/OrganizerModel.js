import mongoose from "mongoose";

const OrganizerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: false, // Allow empty for members
    default: "",
  },
  organizationName: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: function () {
      return !this.isOrganization;
    },
    unique: false,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  tournament: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tournament",
    },
  ],
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
    },
  ],
  isAccountVerified: {
    type: Boolean,
    default: false,
  },
  verifyOtp: {
    type: String,
    default: "",
  },
  verifyOtpExpiredAt: {
    type: Number,
    default: 0,
  },
  // Cluster ID to group organizations
  clusterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizer",
  },
  // Role in the cluster (owner/member)
  role: {
    type: String,
    enum: ["owner", "member"],
    default: "member",
  },
  // Track who added this member to the cluster
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizer",
  },
  // When this member was added to the cluster
  addedAt: {
    type: Date,
    default: Date.now,
  },
  // List of organizations this user has access to within the cluster
  accessibleOrganizations: [
    {
      organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizer",
      },
      role: {
        type: String,
        enum: ["owner", "member"],
        default: "member",
      },
      grantedAt: {
        type: Date,
        default: Date.now,
      },
      grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizer",
      },
    },
  ],
  // Current active organization context for this user
  currentOrganizationContext: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizer",
  },
  // Legacy fields for backward compatibility
  memberAccess: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizer",
    },
  ],
  isVerifiedByAdmin: {
    type: Boolean,
    default: false,
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
  isOrganization: {
    type: Boolean,
    default: false,
  },
  ownedOrganizations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizer",
    },
  ],
  parentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizer",
  },
});

const Organizer = mongoose.model("organizer", OrganizerSchema);

export default Organizer;
