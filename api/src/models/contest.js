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
    },
    totalScore: Number
  }]
}, { timestamps: true });


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
