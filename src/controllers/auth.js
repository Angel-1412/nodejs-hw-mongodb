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
    const { accessToken, refreshToken } = await loginUser({ email, password });

    res
      .cookie('refreshToken', refreshToken, {
        ...cookieOpts,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie('accessToken', accessToken, {
        ...cookieOpts,
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({
        status: 200,
        message: 'Successfully logged in!',
        data: null,
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
    if (!refreshToken) throw createError(401, 'Refresh token is missing');

    const { accessToken, refreshToken: newRefreshToken } = await refresh(
      refreshToken,
    );

    res
      .cookie('refreshToken', newRefreshToken, {
        ...cookieOpts,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie('accessToken', accessToken, {
        ...cookieOpts,
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({
        status: 200,
        message: 'Session refreshed!',
        data: null,
      });
  } catch (error) {
    res.clearCookie('refreshToken', cookieOpts);
    res.clearCookie('accessToken', cookieOpts);
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || null;

    if (refreshToken) {
      await logoutService(refreshToken);
    }

    res
      .clearCookie('refreshToken', cookieOpts)
      .clearCookie('accessToken', cookieOpts)
      .status(204)
      .end();
  } catch (error) {
    res.clearCookie('refreshToken', cookieOpts);
    res.clearCookie('accessToken', cookieOpts);
    next(error);
  }
};
