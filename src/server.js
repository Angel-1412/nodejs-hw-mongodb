import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routers/contacts.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function setupServer() {
  const app = express();

  app.use(cors());
  app.use(pino());
  app.use(express.json());

  app.use('/contacts', contactsRouter);

  app.get('/', (req, res) => {
    res.json({ message: 'Hello from server!' });
  });

  app.use(notFoundHandler);

  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
}
