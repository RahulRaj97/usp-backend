import mongoose, { Schema, Document } from 'mongoose';

export type AgentLevel = 'agent' | 'sub-agent' | 'parent';

export interface IAgent extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone?: string;
  level: AgentLevel;
  companyId?: mongoose.Types.ObjectId;
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
    phone: { type: String },
    level: {
      type: String,
      enum: ['parent', 'sub-agent', 'agent'],
      required: true,
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  },
  { timestamps: true },
);

AgentSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate(
    'user',
    'email role isActive address profileImage isEmailVerified',
  );
  next();
});

AgentSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    if (ret.user) {
      ret.email = ret.user.email;
      ret.profileImage = ret.user.profileImage;
      ret.isActive = ret.user.isActive;
      ret.role = ret.user.role;
      ret.isEmailVerified = ret.user.isEmailVerified;
      ret.address = ret.user.address;
      delete ret.user;
    }
    ret._id = ret._id.toString();
    if (ret.parentId) ret.parentId = ret.parentId.toString();
    if (ret.companyId) ret.companyId = ret.companyId.toString();
    return ret;
  },
});

AgentSchema.method('toClient', function () {
  const obj = this.toObject() as Record<string, any>;
  if (obj._id instanceof mongoose.Types.ObjectId) obj._id = obj._id.toString();
  if (obj.parentId && obj.parentId instanceof mongoose.Types.ObjectId)
    obj.parentId = obj.parentId.toString();
  return obj;
});

export default mongoose.model<IAgent>('Agent', AgentSchema);
