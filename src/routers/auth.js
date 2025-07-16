import express from 'express';
import { registerController, loginController } from '../controllers/auth.js';
import validateBody from '../middlewares/validateBody.js';
import { registerSchema } from '../models/userSchemas.js';
import { loginSchema } from '../models/authSchemas.js';
import { refreshSession } from '../controllers/auth.js';
import { logoutController } from '../controllers/auth.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), registerController);

router.post('/login', validateBody(loginSchema), loginController);

router.post('/refresh', refreshSession);

router.post('/logout', authenticate, logoutController);

export default router;
