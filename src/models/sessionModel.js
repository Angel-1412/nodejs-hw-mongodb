import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true,
    },
    tokenVersion: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  { timestamps: true },
);

export const Session = mongoose.model('Session', sessionSchema);
