import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { isSessionValid } from '../services/auth.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'accessSecret123';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next(createError(401, 'Not authorized'));
    }

    const token = authHeader.slice(7);

    if (!token) {
      return next(createError(401, 'Not authorized'));
    }

    const secret = process.env.JWT_ACCESS_SECRET || 'accessSecret123';
    const payload = jwt.verify(token, secret);

    if (!payload.userId || !payload.sessionId) {
      return next(createError(401, 'Not authorized'));
    }

    const isSessionActive = await isSessionValid(payload.sessionId);
    if (!isSessionActive) {
      console.log('❌ Session invalidated');
      return next(createError(401, 'Not authorized'));
    }

    req.user = { _id: payload.userId };
    next();
  } catch (error) {
    next(createError(401, 'Not authorized'));
  }
};
