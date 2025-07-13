import mongoose from 'mongoose';

const TeamGroupSchema = new mongoose.Schema({
    teamName: { 
      type: String, 
      required: true 
   },
   members:[
        {
          player: { 
             type: mongoose.Schema.Types.ObjectId, 
             ref: 'player',
             required: true
          }, 
          name:{
            type:String,
            required:true,
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
        }
   ],
     entry:{
        type:String,
        enum:['online','offline'],
        default:'online'
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
      type: mongoose.Schema.Types.Mixed, // Store custom fields as an object
      default: undefined
    }
})
        
const TeamGroup = mongoose.model('teamGroup',TeamGroupSchema);

export default TeamGroup;