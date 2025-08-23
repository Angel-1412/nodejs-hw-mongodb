import createError from 'http-errors';
import {
  registerUser,
  loginUser,
  refresh,
  logout as logoutService,
} from '../services/auth.js';

const cookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  path: '/',
};

export const registerController = async (req, res) => {
  const user = await registerUser(req.body);
  const { password, ...safeUser } = user;

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: safeUser,
  });
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { sessionId, accessToken } = await loginUser({ email, password });

    res
      .cookie('sessionId', sessionId, {
        ...cookieOpts,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        status: 200,
        message: 'Successfully logged in!',
        data: { accessToken },
      });
  } catch (error) {
    res.status(401).json({
      status: 401,
      message: error.message || 'Login failed',
      data: null,
    });
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) throw createError(401, 'Session ID is missing');

    const { accessToken, newSessionId } = await refresh(sessionId);

    res
      .cookie('sessionId', newSessionId, {
        ...cookieOpts,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        status: 200,
        message: 'Session refreshed!',
        data: { accessToken },
      });
  } catch (error) {
    res.clearCookie('sessionId', cookieOpts);
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || null;

    if (sessionId) {
      await logoutService(sessionId);
    }

    res.clearCookie('sessionId', cookieOpts).status(204).end();
  } catch (error) {
    res.clearCookie('sessionId', cookieOpts);
    next(error);
  }
};
