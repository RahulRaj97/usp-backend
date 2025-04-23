import { FilterQuery } from 'mongoose';
import programmeModel, {
  IProgramme,
  ProgrammeType,
  DeliveryMethod,
  IProgramIntake,
  IProgramRequirement,
} from '../models/programmeModel';
import { NotFoundError } from '../utils/appError';
import { uploadFileBufferToS3 } from './s3UploadHelpter';

export interface AgentProgrammeFilters {
  search?: string;
  universityId?: string;
  type?: ProgrammeType;
  deliveryMethod?: DeliveryMethod;
  openIntakeOnly?: boolean;
  minTuition?: number;
  maxTuition?: number;
  minApplicationFee?: number;
  maxApplicationFee?: number;
  page?: number;
  limit?: number;
}

export interface AdminProgrammeFilters extends AgentProgrammeFilters {
  published?: boolean;
}

export interface AdminCreateProgrammeDto {
  universityId: string;
  name: string;
  type: ProgrammeType;
  description?: string;
  lengthBreakdown?: string;
  deliveryMethod?: DeliveryMethod;
  tuitionFee?: number;
  applicationFee?: number;
  otherFees?: string[];
  published?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  intakes?: IProgramIntake[];
  programRequirement?: IProgramRequirement;
  modules?: string[];
  services?: string[];
  // multer‐populated
  imageFiles?: Express.Multer.File[];
}

export interface AdminUpdateProgrammeDto {
  universityId?: string;
  name?: string;
  type?: ProgrammeType;
  description?: string;
  lengthBreakdown?: string;
  deliveryMethod?: DeliveryMethod;
  tuitionFee?: number;
  applicationFee?: number;
  otherFees?: string[];
  published?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  intakes?: IProgramIntake[];
  programRequirement?: IProgramRequirement;
  modules?: string[];
  services?: string[];
  // multer‐populated
  imageFiles?: Express.Multer.File[];
}

interface ProgrammeResponse {
  id: string;
  university: Record<string, any>;
  name: string;
  description?: string;
  type: ProgrammeType;
  lengthBreakdown?: string;
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

async function projectProgramme(doc: IProgramme & { universityId: any }) {
  // ensure we have the full university object
  const uni = doc.universityId.toObject() as any;
  uni.id = uni._id.toString();
  delete uni._id;
  delete uni.__v;
  const o = doc.toObject();
  return {
    id: o._id.toString(),
    university: uni,
    name: o.name,
    type: o.type,
    description: o.description,
    lengthBreakdown: o.lengthBreakdown,
    deliveryMethod: o.deliveryMethod,
    tuitionFee: o.tuitionFee,
    applicationFee: o.applicationFee,
    otherFees: o.otherFees,
    published: o.published,
    metaTitle: o.metaTitle,
    metaDescription: o.metaDescription,
    metaKeywords: o.metaKeywords,
    intakes: o.intakes,
    programRequirement: o.programRequirement,
    modules: o.modules,
    services: o.services,
    images: o.images,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

/** AGENT: list only published programmes with filters */
export async function listProgrammesForAgent(filters: AgentProgrammeFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const query: FilterQuery<IProgramme> = {};

  if (filters.search) {
    const re = new RegExp(filters.search, 'i');
    query.$or = [{ name: re }, { lengthBreakdown: re }];
  }
  if (filters.universityId) query.universityId = filters.universityId;
  if (filters.type) query.type = filters.type;
  if (filters.deliveryMethod) query.deliveryMethod = filters.deliveryMethod;
  if (filters.minTuition != null || filters.maxTuition != null) {
    query.tuitionFee = {
      ...(filters.minTuition != null ? { $gte: filters.minTuition } : {}),
      ...(filters.maxTuition != null ? { $lte: filters.maxTuition } : {}),
    };
  }
  if (filters.minApplicationFee != null) {
    query.applicationFee = { $gte: filters.minApplicationFee };
  }
  if (filters.maxApplicationFee != null) {
    query.applicationFee = {
      ...(query.applicationFee || {}),
      $lte: filters.maxApplicationFee,
    };
  }
  if (filters.openIntakeOnly) {
    query.intakes = { $elemMatch: { status: 'open' } };
  }

  const [docs, total] = await Promise.all([
    programmeModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })
      .populate('universityId', 'name logo website'),
    programmeModel.countDocuments(query),
  ]);

  return {
    programmes: await Promise.all(docs.map((d) => projectProgramme(d))),
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

/** AGENT: get one published programme */
export async function getProgrammeByIdForAgent(id: string) {
  const prog = await programmeModel
    .findOne({ _id: id, published: true })
    .populate('universityId', 'name logo website');
  if (!prog) throw new NotFoundError('Programme not found or unpublished');
  return await projectProgramme(prog);
}

/** ADMIN: list with same + published/unpublished */
export async function listProgrammesAdmin(filters: AdminProgrammeFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const query: FilterQuery<IProgramme> = {};
  if (filters.published != null) query.published = filters.published;
  if (filters.search) {
    const re = new RegExp(filters.search, 'i');
    query.$or = [{ name: re }, { lengthBreakdown: re }];
  }
  if (filters.universityId) query.universityId = filters.universityId;
  if (filters.type) query.type = filters.type;
  if (filters.deliveryMethod) query.deliveryMethod = filters.deliveryMethod;
  if (filters.minTuition != null || filters.maxTuition != null) {
    query.tuitionFee = {
      ...(filters.minTuition != null ? { $gte: filters.minTuition } : {}),
      ...(filters.maxTuition != null ? { $lte: filters.maxTuition } : {}),
    };
  }
  if (filters.minApplicationFee != null) {
    query.applicationFee = { $gte: filters.minApplicationFee };
  }
  if (filters.maxApplicationFee != null) {
    query.applicationFee = {
      ...(query.applicationFee || {}),
      $lte: filters.maxApplicationFee,
    };
  }
  if (filters.openIntakeOnly) {
    query.intakes = { $elemMatch: { status: 'open' } };
  }

  const [docs, total] = await Promise.all([
    programmeModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })
      .populate('universityId', 'name logo website'),
    programmeModel.countDocuments(query),
  ]);

  return {
    programmes: await Promise.all(docs.map((d) => projectProgramme(d))),
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

/** ADMIN: get one (any published state) */
export async function getProgrammeByIdForAdmin(id: string) {
  const prog = await programmeModel
    .findById(id)
    .populate('universityId', 'name logo website');
  if (!prog) throw new NotFoundError('Programme not found');
  return await projectProgramme(prog);
}

/**
 * ADMIN: create — then upload any images under `programmes/{id}/…`
 */
export async function createProgrammeAdmin(
  dto: AdminCreateProgrammeDto,
): Promise<ProgrammeResponse> {
  // 1) create base doc (no images yet)
  const created = await programmeModel.create({
    universityId: dto.universityId,
    description: dto.description,
    name: dto.name,
    type: dto.type,
    lengthBreakdown: dto.lengthBreakdown,
    deliveryMethod: dto.deliveryMethod,
    tuitionFee: dto.tuitionFee,
    applicationFee: dto.applicationFee,
    otherFees: dto.otherFees || [],
    published: dto.published,
    metaTitle: dto.metaTitle,
    metaDescription: dto.metaDescription,
    metaKeywords: dto.metaKeywords || [],
    intakes: dto.intakes || [],
    programRequirement: dto.programRequirement,
    modules: dto.modules || [],
    services: dto.services || [],
    images: [],
  });

  // 2) if any files, upload and update images[]
  if (dto.imageFiles && dto.imageFiles.length) {
    const urls = await Promise.all(
      dto.imageFiles.map((file) =>
        uploadFileBufferToS3(
          file.buffer,
          file.originalname,
          'programmes',
          created.id.toString(),
          file.mimetype,
        ),
      ),
    );
    created.images = urls;
    await created.save();
  }

  const programme = await programmeModel
    .findById(created.id)
    .populate('universityId', 'name logo website');

  if (!programme) throw new NotFoundError('Programme not found');
  return await projectProgramme(programme);
}

/**
 * ADMIN: update any of the above fields; append new images if provided
 */
export async function updateProgrammeAdmin(
  id: string,
  dto: Partial<AdminUpdateProgrammeDto>,
): Promise<ProgrammeResponse> {
  const prog = await programmeModel.findById(id);
  if (!prog) throw new NotFoundError('Programme not found');

  // simple fields
  for (const field of [
    'universityId',
    'name',
    'description',
    'type',
    'lengthBreakdown',
    'deliveryMethod',
    'tuitionFee',
    'applicationFee',
    'otherFees',
    'published',
    'metaTitle',
    'metaDescription',
    'metaKeywords',
    'intakes',
    'programRequirement',
    'modules',
    'services',
  ] as (keyof AdminUpdateProgrammeDto)[]) {
    if (dto[field] !== undefined) {
      // @ts-ignore
      prog[field] = dto[field] as any;
    }
  }

  // images: append
  if (dto.imageFiles && dto.imageFiles.length) {
    const newUrls = await Promise.all(
      dto.imageFiles.map((file) =>
        uploadFileBufferToS3(
          file.buffer,
          file.originalname,
          'programmes',
          prog.id.toString(),
          file.mimetype,
        ),
      ),
    );
    prog.images.push(...newUrls);
  }

  await prog.save();
  return await projectProgramme(prog);
}

/** ADMIN: hard delete */
export async function deleteProgrammeAdmin(id: string): Promise<void> {
  const res = await programmeModel.findByIdAndDelete(id);
  if (!res) throw new NotFoundError('Programme not found');
}
