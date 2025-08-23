import bcrypt from 'bcrypt';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { Session } from '../models/sessionModel.js';
import mongoose from 'mongoose';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'accessSecret123';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshSecret456';
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '30d';

export async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createError(409, 'Email already in use');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  return user.toObject({ virtuals: true });
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw createError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createError(401, 'Invalid credentials');

  const payload = { userId: user._id };
  const [accessToken, refreshToken] = await Promise.all([
    jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES }),
    jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES }),
  ]);

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    sessionId: session._id.toString(),
  };
}

export async function refresh(sessionId) {
  if (!sessionId) throw createError(401, 'Session ID required');

  const session = await Session.findById(sessionId);
  if (!session || session.refreshTokenValidUntil < new Date()) {
    await Session.findByIdAndDelete(sessionId);
    throw createError(401, 'Invalid or expired session');
  }

  try {
    jwt.verify(session.refreshToken, REFRESH_SECRET);
  } catch (error) {
    await Session.findByIdAndDelete(sessionId);
    throw createError(401, 'Invalid refresh token');
  }

  const payload = { userId: session.userId };
  const [newAccessToken, newRefreshToken] = await Promise.all([
    jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES }),
    jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES }),
  ]);

  const updatedSession = await Session.findByIdAndUpdate(
    sessionId,
    {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    { new: true },
  );

  return {
    accessToken: newAccessToken,
    newSessionId: updatedSession._id.toString(),
  };
}

export async function logout(sessionId) {
  if (!sessionId) return;
  await Session.findByIdAndDelete(sessionId);
}
