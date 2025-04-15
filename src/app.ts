import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './swagger';
import { globalErrorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/authRoutes';
import agentRoutes from './routes/agentRoutes';
import companyRoutes from './routes/companyRoutes';
import studentRoutes from './routes/studentRoutes';
import universityRoutes from './routes/universityRoutes';
import programmeRoutes from './routes/programmeRoutes';
import applicationRoutes from './routes/applicationRoutes';
import searchRoutes from './routes/searchRoutes';

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

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

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/programmes', programmeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/search', searchRoutes);

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
