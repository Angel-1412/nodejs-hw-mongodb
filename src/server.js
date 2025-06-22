import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routes/contactsRouter.js';

export function setupServer() {
  const app = express();

  app.use(cors());
  app.use(pino());

  app.use('/contacts', contactsRouter);

  app.get('/', (req, res) => {
    res.json({ message: 'Hello from server!' });
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
}
