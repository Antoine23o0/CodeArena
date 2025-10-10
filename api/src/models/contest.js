import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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

export default mongoose.model("Contest", contestSchema);
