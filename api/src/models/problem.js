import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  inputs: {
    type: [String],
    default: []
  },
  expectedOutputs: {
    type: [String],
    default: []
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  maxScore: {
    type: Number,
    default: 100
  }
}, { timestamps: true });

export default mongoose.model("Problem", problemSchema);
