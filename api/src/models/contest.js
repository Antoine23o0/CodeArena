import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  EndDate: {
    type: Date,
    required: true
  },
  problemsList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem"
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  scores: [{
    utilisateurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    totalScore: Number
  }]
}, { timestamps: true });

export default mongoose.model("Contest", contestSchema);
