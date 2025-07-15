import { registerUser } from '../services/auth.js';
import { loginUser } from '../services/auth.js';
import { refresh } from '../services/auth.js';
import { logout } from '../services/auth.js';
import createError from 'http-errors';

export const registerController = async (req, res) => {
  const user = await registerUser(req.body);

  const { password, ...safeUser } = user.toObject();

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: safeUser, 
  });
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await loginUser({ email, password });

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, 
      })
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, 
      });

    res.status(200).json({
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
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw createError(401, 'Refresh token is missing');
    }

    const { accessToken, newRefreshToken } = await refresh(refreshToken);

    res
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

    res.status(200).json({
      status: 'success',
      message: 'Session refreshed!',
      data: { accessToken },
    });
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
    }
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    await logout(req.cookies.refreshToken);
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
