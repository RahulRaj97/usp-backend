// =====================================================================
// File: src/models/adminModel.ts
// =====================================================================
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  // Virtuals from User
  email?: string;
  profileImage?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Additional admin-specific fields could go here (e.g., role-specific extensions)
  },
  { timestamps: true },
);

// Automatically populate the 'user' field on queries
AdminSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate(
    'user',
    'email role isActive address profileImage isEmailVerified',
  );
  next();
});

// When converting to JSON, merge user properties
AdminSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    if (ret.user) {
      ret.email = ret.user.email;
      ret.profileImage = ret.user.profileImage;
      ret.isActive = ret.user.isActive;
      ret.isEmailVerified = ret.user.isEmailVerified;
      ret.address = ret.user.address;
    }
    delete ret.user;
    return ret;
  },
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
