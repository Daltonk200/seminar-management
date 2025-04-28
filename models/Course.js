// models/Course.js
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  participants: { 
    type: Number, 
    required: true 
  },
  notes: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  },
  trainer_price: { 
    type: Number, 
    required: true 
  },
  trainer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trainer' 
  }
}, {
  timestamps: true
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);