import mongoose, { Schema, Document } from 'mongoose';

export type AgentLevel = 'agent' | 'sub-agent' | 'parent';

export interface IAgent extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  profileImage?: string;
  level: AgentLevel;
  parentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String },
    phone: { type: String },
    profileImage: { type: String },
    level: {
      type: String,
      enum: ['agent', 'sub-agent', 'parent'],
      required: true,
      index: true,
    },
    parentId: { type: mongoose.Types.ObjectId, ref: 'Agent' },
  },
  { timestamps: true },
);

export default mongoose.model<IAgent>('Agent', AgentSchema);
