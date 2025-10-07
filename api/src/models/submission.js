import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest"
  },
  sourceCode: {
    type: String,
    required: true
  },
  result: {
    type: String,
    enum: ["Success", "Compilation error", "Tests failed", "Timeout"],
    default: "Tests failed"
  },
  score: {
    type: Number,
    default: 0
  },
  submissionDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);
