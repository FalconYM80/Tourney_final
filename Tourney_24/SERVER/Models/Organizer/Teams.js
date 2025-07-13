import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  player: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'player',
    required:true,
 }, 
  name: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true 
  },
  mobile: { 
    type: String, 
    required: true 
  },
  academyName: { 
    type: String, 
    required: true 
  },
  feesPaid: { 
    type: Boolean, 
    default: false 
  },
}, { _id: false });

const TeamSchema = new mongoose.Schema({
  tournament: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'tournament', 
    required: true 
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'event', 
    required: true 
  },
  entryType: { 
    type: String, 
    enum: ['online', 'offline'], 
    default: 'offline' 
  },
  teamName: { 
    type: String, 
    required: true 
  },
  members: { 
    type: [TeamMemberSchema], 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'organizer', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps:true } );

const Team = mongoose.model('team', TeamSchema);
export default Team;
