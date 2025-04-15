import mongoose, { Schema, Document } from 'mongoose';

export type ProgrammeType =
  | 'bachelor'
  | 'master'
  | 'phd'
  | 'associate'
  | 'diploma'
  | 'certificate'
  | 'exchange'
  | 'foundation'
  | 'executive';

export type SubjectArea =
  | 'computer_science'
  | 'engineering'
  | 'business'
  | 'agriculture'
  | 'arts'
  | 'education'
  | 'law'
  | 'medicine'
  | 'social_sciences'
  | 'natural_sciences'
  | 'environmental_science'
  | 'mathematics'
  | 'economics'
  | 'design'
  | 'media'
  | 'philosophy'
  | 'psychology'
  | 'international_relations'
  | 'data_science';

export interface IProgramme extends Document {
  _id: mongoose.Types.ObjectId;
  universityId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: ProgrammeType;
  subjectArea: SubjectArea;
  durationSemesters: number;
  startDate: Date;
  endDate?: Date;
  tuitionFee: string;
  applicationFee?: string;
  intakes?: string[];
  modules: string[];
  entryRequirements: string[];
  services?: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProgrammeSchema: Schema = new Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: [
        'bachelor',
        'master',
        'phd',
        'associate',
        'diploma',
        'certificate',
        'exchange',
        'foundation',
        'executive',
      ],
      required: true,
    },
    subjectArea: {
      type: String,
      enum: [
        'computer_science',
        'engineering',
        'business',
        'agriculture',
        'arts',
        'education',
        'law',
        'medicine',
        'social_sciences',
        'natural_sciences',
        'environmental_science',
        'mathematics',
        'economics',
        'design',
        'media',
        'philosophy',
        'psychology',
        'international_relations',
        'data_science',
      ],
      required: true,
    },
    durationSemesters: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    tuitionFee: { type: String, required: true },
    applicationFee: { type: String },
    intakes: [{ type: String }],
    modules: [{ type: String }],
    entryRequirements: [{ type: String }],
    services: [{ type: String }],
    images: [{ type: String }],
  },
  { timestamps: true },
);

ProgrammeSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate(
    'universityId',
    'name logo website contactEmail phone address description',
  );
  next();
});

export default mongoose.model<IProgramme>('Programme', ProgrammeSchema);
