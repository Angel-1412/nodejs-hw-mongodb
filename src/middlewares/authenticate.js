import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { Session } from '../models/sessionModel.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'accessSecret123';

export const authenticate = async (req, res, next) => {
  try {
    const accessFromCookie = req.cookies?.accessToken;

    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    const token = accessFromCookie || bearer;
    if (!token) throw createError(401, 'Not authorized');

    const payload = jwt.verify(token, ACCESS_SECRET);

    const session = await Session.findOne({
      userId: payload.userId,
      accessToken: token,
    });
    if (!session) throw createError(401, 'Not authorized');

    req.user = { _id: payload.userId };
    next();
  } catch (err) {
    next(createError(401, 'Not authorized'));
  }
};
