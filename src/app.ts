import express, { Application, Request, Response, NextFunction } from 'express';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((_: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

export default app;
