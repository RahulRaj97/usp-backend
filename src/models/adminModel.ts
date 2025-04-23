import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone?: string;
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
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
  },
  { timestamps: true },
);

AdminSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate(
    'user',
    'email role isActive address profileImage isEmailVerified',
  );
  next();
});

AdminSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.firstName = ret.firstName;
    ret.lastName = ret.lastName;
    ret.phone = ret.phone;
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
