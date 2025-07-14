import bcrypt from 'bcrypt';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { Session } from '../models/sessionModel.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'accessSecret123';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshSecret456';
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '30d';

export async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  return user.toObject({ virtuals: true });
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createError(401, 'Invalid credentials');
  }

  const payload = { userId: user._id };
  const [accessToken, refreshToken] = await Promise.all([
    jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES }),
    jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES }),
  ]);

  await Session.findOneAndUpdate(
    { userId: user._id },
    {
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true },
  );

  return { accessToken, refreshToken };
}

export async function refresh(refreshToken) {
  if (!refreshToken) throw createError(401, 'Refresh token required');

  try {
    const { userId } = jwt.verify(refreshToken, REFRESH_SECRET);
    const session = await Session.findOne({ userId, refreshToken });

    if (!session || session.refreshTokenValidUntil < new Date()) {
      await Session.deleteOne({ userId });
      throw createError(401, 'Invalid or expired refresh token');
    }

    const payload = { userId };
    const [newAccessToken, newRefreshToken] = await Promise.all([
      jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES }),
      jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES }),
    ]);

    await Session.findOneAndUpdate(
      { userId },
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
        refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw createError(401, 'Invalid token');
    }
    throw error;
  }
}

export async function logout(refreshToken) {
  if (!refreshToken) throw createError(401, 'Not authorized');

  try {
    const { userId } = jwt.verify(refreshToken, REFRESH_SECRET);
    await Session.deleteOne({ userId, refreshToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw createError(401, 'Invalid token');
    }
    throw error;
  }
}
