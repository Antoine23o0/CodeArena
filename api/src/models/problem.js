import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
    },
    timeLimitMs: {
      type: Number,
      default: 3000,
    },
    memoryLimitMb: {
      type: Number,
      default: 256,
    },
    testCases: {
      type: [
        {
          input: {
            type: String,
            default: '',
          },
          expectedOutput: {
            type: String,
            required: true,
          },
          hidden: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Problem", problemSchema);
