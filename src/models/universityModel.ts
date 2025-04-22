// models/universityModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './userModel';

export interface IUniversity extends Document {
  name: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  address?: IAddress;
  description?: string;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
});

const UniversitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true, unique: true },
    logo: String,
    website: String,
    contactEmail: String,
    phone: String,
    address: AddressSchema,
    description: String,
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true },
);

export default mongoose.model<IUniversity>('University', UniversitySchema);
