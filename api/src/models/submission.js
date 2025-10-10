import mongoose from "mongoose";
import Problem from './problem.js';
import Contest from './contest.js';

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      required: true,
    },
    language: {
      type: String,
      enum: ['python', 'java', 'c'],
      default: 'python',
    },
    sourceCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded'],
      default: 'Pending',
    },
    score: {
      type: Number,
      default: 0,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    stdout: {
      type: String,
      default: '',
    },
    stderr: {
      type: String,
      default: '',
    },
    testResults: [
      {
        input: String,
        expectedOutput: String,
        output: String,
        passed: Boolean,
      },
    ],
    submissionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Compound index to quickly lookup submissions by event and user
submissionSchema.index({ eventId: 1, userId: 1, problemId: 1 });

// Pre-save hook to calculate score based on problem maxScore and result
submissionSchema.pre('save', async function(next) {
  try {
    if (this.isModified('result') || this.isNew) {
      const problem = await Problem.findById(this.problemId).select('maxScore');
      const max = problem ? problem.maxScore || 0 : 0;
      // Simple scoring: Success => full score, Compilation error => 0, Tests failed => half, Timeout => 0
      switch (this.result) {
        case 'Success':
          this.score = max;
          break;
        case 'Tests failed':
          this.score = Math.floor(max / 2);
          break;
        default:
          this.score = 0;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// After saving a submission, update contest scores if linked to an event
submissionSchema.post('save', async function(doc) {
  try {
    if (doc.eventId) {
      await Contest.recalculateScores(doc.eventId);
    }
  } catch (err) {
    // non-fatal: log and continue
    console.error('Error recalculating contest scores:', err);
  }
});
export default mongoose.model("Submission", submissionSchema);
