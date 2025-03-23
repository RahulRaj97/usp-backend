import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type ApplicationStage =
  | 'profile_complete'
  | 'documents_uploaded'
  | 'programme_selected'
  | 'application_submitted'
  | 'university_processing'
  | 'offer_received'
  | 'student_confirmed'
  | 'visa_processing'
  | 'finalized';

export interface IApplication extends Document {
  studentId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  programmeIds: mongoose.Types.ObjectId[];
  priorityMapping: {
    programmeId: mongoose.Types.ObjectId;
    priority: number;
  }[];
  status: ApplicationStatus;
  currentStage: ApplicationStage;
  notes?: string;
  supportingDocuments?: string[];
  submittedAt?: Date;
  isWithdrawn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema<IApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    programmeIds: [
      { type: Schema.Types.ObjectId, ref: 'Programme', required: true },
    ],
    priorityMapping: [
      {
        programmeId: {
          type: Schema.Types.ObjectId,
          ref: 'Programme',
          required: true,
        },
        priority: { type: Number, min: 1, max: 3, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    currentStage: {
      type: String,
      enum: [
        'profile_complete',
        'documents_uploaded',
        'programme_selected',
        'application_submitted',
        'university_processing',
        'offer_received',
        'student_confirmed',
        'visa_processing',
        'finalized',
      ],
      default: 'profile_complete',
    },
    notes: { type: String },
    supportingDocuments: [{ type: String }],
    submittedAt: { type: Date },
    isWithdrawn: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<IApplication>('Application', ApplicationSchema);
