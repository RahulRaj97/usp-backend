import mongoose, { Schema, Document } from 'mongoose';

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
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String },
    role: {
      type: String,
      enum: ['agent', 'sub-admin', 'parent'],
      default: 'agent',
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    parentId: { type: mongoose.Types.ObjectId, ref: 'Agent' },
    officeId: { type: mongoose.Types.ObjectId, ref: 'Office' },
    address: { type: AddressSchema },
  },
  { timestamps: true },
);

export default mongoose.model<IAgent>('Agent', AgentSchema);
