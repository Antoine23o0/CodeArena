import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  rank: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  signInDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const hashed = await bcrypt.hash(this.password, SALT_ROUNDS);
        this.password = hashed;
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function() {
  return jwt.sign(
    { id: this._id, userName: this.userName },
    process.env.JWT_SECRET, // in .env file
    { expiresIn: '1h' }
  );
};

export default mongoose.model("User", userSchema);
