import mongoose from 'mongoose';

import appConfig from './app';

const connectDB = async (): Promise<void> => {
  const { uri } = appConfig.database;
  try {
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${uri}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
