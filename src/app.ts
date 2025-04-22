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

import adminAdminRoutes from './routes/admin/adminAdminRoutes';
import adminAppRoutes from './routes/admin/applicationAdminRoutes';
import programmeAdminRoutes from './routes/admin/programmeAdminRoutes';
import universityAdminRoutes from './routes/admin/universityAdminRoutes';
import agentAdminRoutes from './routes/admin/agentAdminRoutes';
import studentAdminRoutes from './routes/admin/studentAdminRoutes';
import companyAdminRoutes from './routes/admin/companyAdminRoutes';

import notificationRoutes from './routes/notificationRoutes';

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With',
  );
  if (req.method === 'OPTIONS') res.sendStatus(200);
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

app.use('/api/admin', adminAdminRoutes);
app.use('/api/admin/companies', companyAdminRoutes);
app.use('/api/admin/applications', adminAppRoutes);
app.use('/api/admin/programmes', programmeAdminRoutes);
app.use('/api/admin/universities', universityAdminRoutes);
app.use('/api/admin/agents', agentAdminRoutes);
app.use('/api/admin/students', studentAdminRoutes);

app.use('/api/notifications', notificationRoutes);

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
