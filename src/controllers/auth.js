import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { registerUser, loginUser, logout } from '../services/auth.js';
import { Session } from '../models/sessionModel.js';

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
    const { accessToken, refreshToken, sessionId } = await loginUser({
      email,
      password,
    });

    res
      .cookie('refreshToken', refreshToken, {
        ...cookieOpts,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie('sessionId', sessionId.toString(), {
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
    const { refreshToken, sessionId } = req.cookies;

    if (!refreshToken || !sessionId) {
      throw createError(401, 'Refresh token or session missing');
    }

    const session = await Session.findById(sessionId);
    if (!session || session.refreshToken !== refreshToken) {
      throw createError(401, 'Invalid refresh token');
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: session.userId.toString() },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' },
    );

    res.status(200).json({
      status: 200,
      message: 'Session refreshed!',
      data: { accessToken },
    });
  } catch (error) {
    res.clearCookie('refreshToken', cookieOpts);
    res.clearCookie('sessionId', cookieOpts);
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;
    if (sessionId) await logout(sessionId);

    res
      .clearCookie('refreshToken', cookieOpts)
      .clearCookie('sessionId', cookieOpts)
      .status(204)
      .end();
  } catch (error) {
    res.clearCookie('refreshToken', cookieOpts);
    res.clearCookie('sessionId', cookieOpts);
    next(error);
  }
};
