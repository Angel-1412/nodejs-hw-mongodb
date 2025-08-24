import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/userModel.js';
import { Session } from '../models/sessionModel.js';
import createError from 'http-errors';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createError(409, 'User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  return user.toObject();
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(401, 'Invalid credentials');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw createError(401, 'Invalid credentials');

  const accessToken = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );

  const refreshToken = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' },
  );

  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  const session = await Session.create({
    userId: user._id,
    refreshToken,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken, sessionId: session._id };
};

export const logout = async (sessionId) => {
  await Session.findByIdAndDelete(sessionId);
};
