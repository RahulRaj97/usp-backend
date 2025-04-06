import mongoose, { Schema, Document } from 'mongoose';

export type Gender = 'male' | 'female' | 'other';
export type ProfileStatus = 'complete' | 'incomplete' | 'pending';

export interface IEducation {
  institutionName: string;
  degree: string;
  grade?: string;
  year: number;
}

export type DocumentType =
  | 'passport'
  | 'academic_result'
  | 'certificate'
  | 'resume'
  | 'other';

export interface IDocument {
  type: DocumentType;
  fileUrl: string;
}

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  gender: Gender;
  phone?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  profileStatus: ProfileStatus;
  education: IEducation[];
  documents: IDocument[];
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema: Schema = new Schema({
  institutionName: { type: String, required: true },
  degree: { type: String, required: true },
  grade: { type: String },
  year: { type: Number, required: true },
});

const DocumentSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['passport', 'academic_result', 'certificate', 'resume', 'other'],
    required: true,
  },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const StudentSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phone: { type: String },
    passportNumber: { type: String },
    passportExpiry: { type: Date },
    profileStatus: {
      type: String,
      enum: ['complete', 'incomplete', 'pending'],
      default: 'pending',
    },
    education: [EducationSchema],
    documents: [DocumentSchema],
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

StudentSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate(
    'user',
    'email role isActive address profileImage isEmailVerified',
  );
  next();
});

StudentSchema.set('toJSON', {
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

    ret._id = ret._id.toString();
    if (ret.agentId) ret.agentId = ret.agentId.toString();
    if (ret.companyId) ret.companyId = ret.companyId.toString();

    return ret;
  },
});

export default mongoose.model<IStudent>('Student', StudentSchema);
