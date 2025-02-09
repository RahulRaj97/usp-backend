import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './swagger';
import { globalErrorHandler } from './middlewares/errorHandler';

import agentRouter from './routes/agentRouter';

const app: Application = express();

app.use(express.json());

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use('/agents', agentRouter);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    globalErrorHandler(err, req, res, next);
  },
);

export default app;
