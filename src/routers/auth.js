import express from 'express';
import {
  registerController,
  loginController,
  refreshSession,
  logoutController,
  sendResetEmailController,
  resetPasswordController,
} from '../controllers/auth.js';
import validateBody from '../middlewares/validateBody.js';
import { registerSchema } from '../models/userSchemas.js';
import {
  loginSchema,
  sendResetEmailSchema,
  resetPasswordSchema,
} from '../models/authSchemas.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), registerController);
router.post('/login', validateBody(loginSchema), loginController);
router.post('/refresh', refreshSession);
router.post('/logout', logoutController);
router.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  sendResetEmailController,
);
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  resetPasswordController,
);

export default router;
