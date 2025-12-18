import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g., "82012"
  name: String,
  roll: String,
  class: String,   
  group: String,
  version: String, // NEW: "Bangla" or "English"
  marks: [
    {
      subject: String,
      term: Number,
      mt: Number,
      total: Number
    }
  ]
});

export default mongoose.model('Student', StudentSchema);