import mongoose from 'mongoose';

const TeamIndividualSchema = new mongoose.Schema({
    player: { 
       type: mongoose.Schema.Types.ObjectId, 
       ref: 'player',
       required: true
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
       default: false,
       required: true 
     },
     entry:{
        type:String,
        enum:['online','offline'],
        default:'offline'
     },
     event:{
      type:String,
      required:true,
     },
     eventId:{
       type: mongoose.Schema.Types.ObjectId, 
       ref: 'event',
       required: true
     },
    tournamentId:{
       type: mongoose.Schema.Types.ObjectId, 
       ref: 'tournament',
       required: true
    },
    dateAndTime:{
      type: String,
      required: true,
    },
     customFields: {
      type: mongoose.Schema.Types.Mixed, 
      default: undefined
    }
})
        
const TeamIndividual = mongoose.model('teamIndividual',TeamIndividualSchema);

export default TeamIndividual;