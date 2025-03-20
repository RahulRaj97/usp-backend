import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './userModel';

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  logo?: string;
  website?: string;
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

const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    website: { type: String },
    logo: { type: String },
    address: { type: AddressSchema },
  },
  { timestamps: true },
);

export default mongoose.model<ICompany>('Company', CompanySchema);
