import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

AdminSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    if (ret.user) {
      ret.email = ret.user.email;
      ret.profileImage = ret.user.profileImage;
      ret.isActive = ret.user.isActive;
      ret.isEmailVerified = ret.user.isEmailVerified;
      ret.address = ret.user.address;
      delete ret.user;
    }
    return ret;
  },
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
