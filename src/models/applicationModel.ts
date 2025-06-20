import mongoose, { Schema, Document } from 'mongoose';
import { customAlphabet } from 'nanoid';

const nano = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export const STATUS_VALUES = [
  'Submitted to USP',
  'Pending Documents',
  'Submitted to University',
  'University Query',
  'Final Decision',
  'Respond to Offer',
] as const;
export type ApplicationStatus = (typeof STATUS_VALUES)[number];

export const STAGE_VALUES = [
  'Collect Personal Information',
  'Search Courses',
  'Save Courses',
  'Complete Study Preferences',
  'Capture Any Additional Details',
  'Shortlist Courses',
  'Collect Documents',
  'Review Application',
  'Submit Application to USP',
  'Complete Application Form',
  'Review Visa Suitability',
  'Review Documents',
  'Approve and Proceed',
  'Message QCV about',
  'Message QCV about Visa Docs',
  'Upload Offers & Acceptance Docs',
  'Receive offers & Acceptance Documents',
  'Notify student of offers',
  'Complete acceptance forms',
  'Upload completed acceptance docs',
  'Message admissions about payment',
  'Upload proof of payment',
  'Submit acceptance and payment proof',
  'Receive Confirmation Enrolment (CoE, LOA, CAS,i20)',
  'Upload Enrolment Confirmation',
  'Message Counsellor about enrolment',
  'Download Enrolment Confirmation (CoE, LOA, CAS,i20)',
  'Notify Student of Enrolment Confirmation (CoE, LOA, CAS,i20)',
  'Collect Remaining Visa Docs',
  'Upload Remaining Visa Docs',
  'Collect visa documents',
  'Upload visa documents',
  'Organise medical',
  'Organise biometrics interview',
  'Organise visa interview training',
  'Lodge visa application',
  'Upload visa result letter',
  'Notify student',
  'Initiate deferment process(if required)',
  'Initiate refund process(if required)',
  'Invoice University',
  'University Payment Received',
  'Pay Channel Partner',
] as const;
export type ApplicationStage = (typeof STAGE_VALUES)[number];

export interface StageHistoryEntry {
  stage: ApplicationStage;
  notes?: string;
  completedAt: Date;
}

const StageHistorySchema = new Schema<StageHistoryEntry>(
  {
    stage: { type: String, enum: STAGE_VALUES, required: true },
    notes: String,
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export interface StageStatusEntry {
  stage: ApplicationStage;
  done: boolean;
  doneAt?: Date;
  doneBy?: mongoose.Types.ObjectId;
  notes?: string;
  attachments?: string[];
}

const StageStatusSchema = new Schema<StageStatusEntry>({
  stage: { type: String, enum: STAGE_VALUES, required: true },
  done: { type: Boolean, default: false },
  doneAt: { type: Date },
  doneBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  notes: { type: String },
  attachments: [{ type: String }],
}, { _id: false });

export interface Comment {
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<Comment>({
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  applicationCode: string;
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
  isDuplicate: boolean;
  duplicateApplicationId?: mongoose.Types.ObjectId;
  stageHistory: StageHistoryEntry[];
  stageStatus: StageStatusEntry[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationCode: { type: String, required: true, unique: true },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

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
      enum: STATUS_VALUES,
      default: 'Submitted to USP',
      required: true,
    },

    currentStage: {
      type: String,
      enum: STAGE_VALUES,
      default: STAGE_VALUES[0],
      required: true,
    },

    notes: String,
    supportingDocuments: [String],
    submittedAt: Date,
    isWithdrawn: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
    duplicateApplicationId: { type: Schema.Types.ObjectId, ref: 'Application' },

    stageHistory: {
      type: [StageHistorySchema],
      default: [],
    },

    stageStatus: {
      type: [StageStatusSchema],
      default: [],
    },

    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true },
);

ApplicationSchema.pre('validate', function (next) {
  if (this.isNew && !this.applicationCode) {
    this.applicationCode = `APP-${nano()}`;
  }
  next();
});

export default mongoose.model<IApplication>('Application', ApplicationSchema);
