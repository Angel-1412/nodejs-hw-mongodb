import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import {
  registerUser,
  loginUser,
  logout,
  refreshAccessToken,
  generateResetToken,
  verifyResetToken,
  updateUserPassword,
} from '../services/auth.js';
import { User } from '../models/userModel.js';
import { sendResetPasswordEmail } from '../utils/nodemailer.js';

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

    const newAccessToken = await refreshAccessToken(refreshToken, sessionId);

    res.status(200).json({
      status: 200,
      message: 'Session refreshed!',
      data: { accessToken: newAccessToken },
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

export const sendResetEmailController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'User not found!');
    }

    const resetToken = generateResetToken(email);

    const emailSent = await sendResetPasswordEmail(email, resetToken);

    if (!emailSent) {
      throw createError(
        500,
        'Failed to send the email, please try again later.',
      );
    }

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const decoded = verifyResetToken(token);

    await updateUserPassword(decoded.email, password);

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
