import mongoose, { Schema, Document } from 'mongoose';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  SALES_REGIONAL_DIRECTOR = 'sales_regional_director',
  SALES_COUNTRY_MANAGER = 'sales_country_manager',
  SALES_ACCOUNT_MANAGER = 'sales_account_manager',
  ADMISSIONS_MANAGER = 'admissions_manager',
  APPLICATION_PROCESSING = 'application_processing',
  COMPLIANCE = 'compliance',
  FINANCE = 'finance',
}

export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone?: string;
  role: AdminRole;
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
    role: {
      type: String,
      enum: Object.values(AdminRole),
      required: true,
    },
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
    ret.role = ret.role;
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
