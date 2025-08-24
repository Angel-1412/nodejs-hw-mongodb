import jwt from 'jsonwebtoken';
import createError from 'http-errors';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'accessSecret123';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    console.log('Authorization header:', authHeader);

    if (!authHeader.startsWith('Bearer ')) {
      console.log('No Bearer token found');
      throw createError(401, 'Not authorized');
    }

    const token = authHeader.slice(7);
    console.log('Token:', token);

    if (!token) {
      console.log('Empty token');
      throw createError(401, 'Not authorized');
    }

    const payload = jwt.verify(token, ACCESS_SECRET);
    console.log('Payload:', payload);

    req.user = { _id: payload.userId };
    console.log('User set to:', req.user);

    next();
  } catch (err) {
    console.log('Auth error:', err.message);
    next(createError(401, 'Not authorized'));
  }
};
