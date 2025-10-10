import mongoose from "mongoose";

<<<<<<< HEAD
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
  endDate: {
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
=======
const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'running', 'finished'],
      default: 'scheduled',
    },
    difficulty: {
      type: String,
      enum: [
        'Débutant',
        'Débutant+',
        'Intermédiaire',
        'Intermédiaire+',
        'Confirmé',
        'Avancé',
        'Expert',
        'Expert+',
        'Maître',
        'Légende',
      ],
      default: 'Débutant',
      trim: true,
    },
    difficultyOrder: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    problemsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
      },
    ],
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    scores: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        totalScore: {
          type: Number,
          default: 0,
        },
        solved: {
          type: Number,
          default: 0,
        },
        lastSubmissionAt: {
          type: Date,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);


// Recalculate scores for a given contest (event)
contestSchema.statics.recalculateScores = async function(contestId) {
  const Contest = this;
  const Submission = mongoose.model('Submission');
  const contest = await Contest.findById(contestId).populate('problemsList');
  if (!contest) throw new Error('Contest not found');

  const problemIds = contest.problemsList.map(p => p._id);

  // Aggregate best submission per user per problem
  const bestPerUserProblem = await Submission.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(contestId), problemId: { $in: problemIds } } },
    { $sort: { score: -1 } },
    { $group: {
      _id: { userId: '$userId', problemId: '$problemId' },
      bestScore: { $first: '$score' }
    } },
    { $group: {
      _id: '$_id.userId',
      totalScore: { $sum: '$bestScore' }
    } }
  ]);

  // Map results into contest.scores format
  contest.scores = bestPerUserProblem.map(r => ({ userId: r._id, totalScore: r.totalScore }));
  await contest.save();
  return contest.scores;
};

export default mongoose.model("Contest", contestSchema);
