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
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('MongoDB connection successful');
    
    const server = http.createServer(app);
    
    try {
      console.log('Initializing Socket.IO...');
      initSocket(server);
      console.log('Socket.IO initialized successfully');
    } catch (socketError) {
      console.error('Socket.IO initialization failed:', (socketError as Error).message);
      // Continue server startup even if socket fails
    }

    server.listen(port, () =>
      console.log(
        `Server running in ${environment} mode on http://127.0.0.1:${port}`,
      ),
    );

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      handleShutdown(server, 'UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      handleShutdown(server, 'UNHANDLED_REJECTION');
    });

    process.on('SIGTERM', () => handleShutdown(server, 'SIGTERM'));
    process.on('SIGINT', () => handleShutdown(server, 'SIGINT'));
  } catch (error) {
    console.error(`Error starting server: ${(error as Error).message}`);
    console.error('Stack trace:', (error as Error).stack);
    process.exit(1);
  }
};

void startServer();
