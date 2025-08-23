import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { Session } from '../models/sessionModel.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'accessSecret123';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Not authorized');
    }

    const token = authHeader.slice(7);
    if (!token) throw createError(401, 'Not authorized');

    const payload = jwt.verify(token, ACCESS_SECRET);

    const session = await Session.findOne({
      userId: payload.userId,
      accessToken: token,
    });

    if (!session || session.accessTokenValidUntil < new Date()) {
      throw createError(401, 'Not authorized');
    }

    req.user = { _id: payload.userId };
    next();
  } catch (err) {
    next(createError(401, 'Not authorized'));
  }
};
