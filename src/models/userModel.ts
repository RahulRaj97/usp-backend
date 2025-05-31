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
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: 'student' | 'admin' | 'agent';
  profileImage?: string;
  address?: IAddress;
  isActive: boolean;
  isEmailVerified: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema: Schema = new Schema({
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: '' },
}, { _id: false });

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin', 'agent'], required: true },
    profileImage: { type: String },
    address: { type: AddressSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true },
);

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

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await argon2.verify(this.password, candidatePassword);
};

UserSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.refreshToken;
    // Ensure address is properly transformed
    if (ret.address) {
      ret.address = {
        street: ret.address.street || '',
        city: ret.address.city || '',
        state: ret.address.state || '',
        postalCode: ret.address.postalCode || '',
        country: ret.address.country || '',
      };
    }
    return ret;
  },
});

export default mongoose.model<IUser>('User', UserSchema);
