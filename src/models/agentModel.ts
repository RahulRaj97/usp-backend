import argon2 from 'argon2';

import mongoose, { Schema, Document, CallbackError } from 'mongoose';

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IAgent extends Document {
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  password: string;
  phone?: string;
  profileImage?: string;
  role: 'agent' | 'sub-admin' | 'parent';
  isActive: boolean;
  isEmailVerified: boolean;
  parentId?: mongoose.Types.ObjectId;
  officeId?: mongoose.Types.ObjectId;
  address?: IAddress;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema: Schema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String },
});

const AgentSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String },
    role: {
      type: String,
      enum: ['agent', 'sub-admin', 'parent'],
      default: 'agent',
    },
    isActive: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    parentId: { type: mongoose.Types.ObjectId, ref: 'Agent' },
    officeId: { type: mongoose.Types.ObjectId, ref: 'Office' },
    address: { type: AddressSchema },
  },
  { timestamps: true },
);

/**
 * Pre-save hook to hash password before saving
 */
AgentSchema.pre<IAgent>(
  'save',
  async function (next: (err?: CallbackError) => void) {
    if (!this.isModified('password')) return next();
    try {
      this.password = await argon2.hash(this.password, {
        timeCost: 3, // 3 iterations
        parallelism: 1, // Single-threaded (optimal for web apps)
        memoryCost: 2 ** 16, // 64MB
        type: argon2.argon2id, // Argon2id is the most secure
      });
      next();
    } catch (err) {
      next(err as CallbackError);
    }
  },
);

/**
 * Compare passwords using Argon2
 */
AgentSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (err) {
    return false;
  }
};

export default mongoose.model<IAgent>('Agent', AgentSchema);
