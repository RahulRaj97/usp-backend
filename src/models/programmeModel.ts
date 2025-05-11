import mongoose, { Schema, Document } from 'mongoose';

export const TYPE_VALUES = [
  '3_year_bachelors',
  'advanced_diploma',
  'bachelors',
  'certificate',
  'diploma',
  'doctoral_phd',
  'english',
  'integrated_masters',
  'masters_degree',
  'post_graduate_certificate',
  'post_graduate_diploma',
  'topup_degree',
] as const;
export type ProgrammeType = (typeof TYPE_VALUES)[number];

export const DELIVERY_METHODS = ['in_class', 'online', 'blended'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];
export interface IGRERequirements {
  requirementType?: 'none' | 'verbal' | 'quantitative' | 'writing' | 'overall';
  minVerbal?: number;
  minQuantitative?: number;
  minWriting?: number;
  minTotal?: number;
}

const GREReqSchema = new Schema<IGRERequirements>(
  {
    requirementType: {
      type: String,
      enum: ['none', 'verbal', 'quantitative', 'writing', 'overall'],
    },
    minVerbal: Number,
    minQuantitative: Number,
    minWriting: Number,
    minTotal: Number,
  },
  { _id: false },
);

export interface IProgramRequirement {
  englishScoreRequired?: boolean;
  minGpa?: number;
  otherRequirements?: string[];
  // TOEFL
  minToeflReading?: number;
  minToeflWriting?: number;
  minToeflListening?: number;
  minToeflSpeaking?: number;
  minToeflTotal?: number;
  // IELTS
  minIeltsReading?: number;
  minIeltsWriting?: number;
  minIeltsListening?: number;
  minIeltsSpeaking?: number;
  minIeltsAverage?: number;
  minIeltsAnyBand?: number;
  minIeltsAnyBandCount?: number;
  // Duolingo
  minDuolingoScore?: number;
  minDuolingoLiteracyScore?: number;
  minDuolingoConversationScore?: number;
  minDuolingoComprehensionScore?: number;
  minDuolingoProductionScore?: number;
  // PTE
  minPteListening?: number;
  minPteReading?: number;
  minPteSpeaking?: number;
  minPteWriting?: number;
  minPteOverall?: number;
  // GRE
  greRequirements?: IGRERequirements;
}

const ProgramReqSchema = new Schema<IProgramRequirement>(
  {
    englishScoreRequired: Boolean,
    minGpa: Number,
    otherRequirements: { type: [String], default: [] },
    minToeflReading: Number,
    minToeflWriting: Number,
    minToeflListening: Number,
    minToeflSpeaking: Number,
    minToeflTotal: Number,
    minIeltsReading: Number,
    minIeltsWriting: Number,
    minIeltsListening: Number,
    minIeltsSpeaking: Number,
    minIeltsAverage: Number,
    minIeltsAnyBand: Number,
    minIeltsAnyBandCount: Number,
    minDuolingoScore: Number,
    minDuolingoLiteracyScore: Number,
    minDuolingoConversationScore: Number,
    minDuolingoComprehensionScore: Number,
    minDuolingoProductionScore: Number,
    minPteListening: Number,
    minPteReading: Number,
    minPteSpeaking: Number,
    minPteWriting: Number,
    minPteOverall: Number,
    greRequirements: { type: GREReqSchema, default: {} },
  },
  { _id: false },
);

export interface IProgramIntake {
  openDate?: Date;
  submissionDeadline?: Date;
  available: boolean;
  acceptingNewApps: boolean;
  status: 'open' | 'closed' | 'likely_open';
  openTime?: string;
  deadlineTime?: string;
}

const IntakeSchema = new Schema<IProgramIntake>(
  {
    openDate: Date,
    submissionDeadline: Date,
    available: { type: Boolean, default: true },
    acceptingNewApps: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['open', 'closed', 'likely_open'],
      required: true,
    },
    openTime: String,
    deadlineTime: String,
  },
  { _id: false },
);

export interface IProgramme extends Document {
  universityId: mongoose.Types.ObjectId;
  name: string;
  type: ProgrammeType;
  lengthBreakdown?: string;
  description?: string;
  deliveryMethod?: DeliveryMethod;
  tuitionFee?: number;
  applicationFee?: number;
  otherFees: string[];
  published?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  intakes: IProgramIntake[];
  programRequirement?: IProgramRequirement;
  modules: string[];
  services: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProgrammeSchema = new Schema<IProgramme>(
  {
    universityId: {
      type: Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    name: { type: String, required: true},
    description: { type: String },
    type: {
      type: String,
      enum: TYPE_VALUES,
      required: true,
    },
    lengthBreakdown: { type: String },
    deliveryMethod: {
      type: String,
      enum: DELIVERY_METHODS,
      default: 'in_class',
    },
    tuitionFee: Number,
    applicationFee: Number,
    otherFees: { type: [String], default: [] },
    published: Boolean,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: { type: [String], default: [] },
    intakes: { type: [IntakeSchema], default: [] },
    programRequirement: { type: ProgramReqSchema, default: {} },
    modules: { type: [String], default: [] },
    services: { type: [String], default: [] },
    images: { type: [String], default: [] },
  },
  { timestamps: true },
);

ProgrammeSchema.set('toJSON', {
  virtuals: true,
  transform(_, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

ProgrammeSchema.index({ type: 1 });
ProgrammeSchema.index({ name: 'text' });

ProgrammeSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate(
    'universityId',
    'name logo website contactEmail phone address currency',
  );
  next();
});

ProgrammeSchema.index({ name: 'text', description: 'text', lengthBreakdown: 'text' });
ProgrammeSchema.index({ type: 1 });
ProgrammeSchema.index({ deliveryMethod: 1 });
ProgrammeSchema.index({ tuitionFee: 1 });
ProgrammeSchema.index({ applicationFee: 1 });
ProgrammeSchema.index({ 'intakes.status': 1 });
ProgrammeSchema.index({ 'intakes.openDate': 1 });

export default mongoose.model<IProgramme>('Programme', ProgrammeSchema);
