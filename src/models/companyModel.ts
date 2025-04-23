import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './userModel';

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  logo?: string;
  email?: string;
  phone?: string;
  documents?: string[];
  website?: string;
  address?: IAddress;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  ntn?: string;
}

const AddressSchema: Schema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String },
});

const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    website: { type: String },
    phone: { type: String },
    email: { type: String, unique: true },
    logo: { type: String },
    documents: { type: [String] },
    ntn: { type: String },
    address: { type: AddressSchema },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<ICompany>('Company', CompanySchema);
