import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import argon2 from 'argon2';

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'student' | 'admin' | 'agent';
  address?: IAddress;
  isActive: boolean;
  isEmailVerified: boolean;
  refreshToken?: string;
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

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin', 'agent'], required: true },
    address: { type: AddressSchema },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true },
);

/**
 * Pre-save hook to hash password before saving
 */
UserSchema.pre<IUser>(
  'save',
  async function (next: (err?: CallbackError) => void) {
    if (!this.isModified('password')) return next();
    try {
      this.password = await argon2.hash(this.password, {
        timeCost: 3,
        parallelism: 1,
        memoryCost: 2 ** 16,
        type: argon2.argon2id,
      });
      next();
    } catch (err) {
      next(err as CallbackError);
    }
  },
);

/**
 * Compare password using Argon2
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await argon2.verify(this.password, candidatePassword);
};

export default mongoose.model<IUser>('User', UserSchema);
