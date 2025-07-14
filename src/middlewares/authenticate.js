import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../models/userModel.js';

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'accessSecret123';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw createHttpError(401, 'Not authorized');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw createHttpError(401, 'Not authorized');
    }

    const { userId } = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(userId);

    if (!user) {
      throw createHttpError(401, 'Not authorized');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(createHttpError(401, 'Access token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(createHttpError(401, 'Not authorized'));
    } else {
      next(error);
    }
  }
};
