// models/Trainer.js
import mongoose from 'mongoose';

const TrainerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  training_subjects: { 
    type: [String], 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.models.Trainer || mongoose.model('Trainer', TrainerSchema);