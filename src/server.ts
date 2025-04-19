import http from 'http';
import mongoose from 'mongoose';

import app from './app';
import config from './config';
import connectDB from './config/database';

import { initSocket } from './socket';

const { port, environment } = config.app;

const handleShutdown = (server: http.Server, signal: string): void => {
  console.log(`${signal} signal received: closing HTTP server.`);
  server.close(() => {
    mongoose.connection
      .close()
      .then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      })
      .catch((error) => {
        console.error(`Error during shutdown: ${(error as Error).message}`);
        process.exit(1);
      });
  });
};

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    const server = http.createServer(app);
    initSocket(server);
    server.listen(port, () =>
      console.log(
        `Server running in ${environment} mode on http://127.0.0.1:${port}`,
      ),
    );
    process.on('SIGTERM', () => handleShutdown(server, 'SIGTERM'));
    process.on('SIGINT', () => handleShutdown(server, 'SIGINT'));
  } catch (error) {
    console.error(`Error starting server: ${(error as Error).message}`);
    process.exit(1);
  }
};

void startServer();
