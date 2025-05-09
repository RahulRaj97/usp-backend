import mongoose from 'mongoose';
import crypto from 'crypto';

const verificationTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  type: { type: String, required: true, enum: ['subagent'] },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create index for automatic cleanup of expired tokens
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationTokenModel = mongoose.model('VerificationToken', verificationTokenSchema);

// Helper function to generate a verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
}; 