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
  type?: ProgrammeType[];                // multi-select programme types
  deliveryMethod?: DeliveryMethod[];      // multi-select delivery methods
  location?: string[];                    // city or country codes from university.address
  intakeStatus?: IProgramIntake['status'][]; // e.g. ['open','likely_open']
  intakeDateFrom?: Date;                  // lower bound on intake.openDate
  intakeDateTo?: Date;                    // upper bound on intake.openDate
  minTuition?: number;
  maxTuition?: number;
  minApplicationFee?: number;
  maxApplicationFee?: number;
  openIntakeOnly?: boolean;               // shorthand for status=open
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
  const uni = doc.universityId?.toObject ? doc.universityId.toObject() : doc.universityId;
  uni.id = uni._id.toString();
  delete uni._id;
  delete uni.__v;
  const o = doc.toObject ? doc.toObject() : doc;
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
  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 20;
  const skip  = (page - 1) * limit;

  // 1) Build the "match" object for Programme fields:
  const match: FilterQuery<IProgramme> = {};

  if (filters.search) {
    // Escape special characters in the search string
    const escapedSearch = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escapedSearch, 'i');
    match.$or = [
      { name: re },
      { description: re },
      { lengthBreakdown: re }
    ];
  }

  if (filters.type)           match.type           = { $in: filters.type };
  if (filters.deliveryMethod) match.deliveryMethod = { $in: filters.deliveryMethod };

  if (filters.minTuition || filters.maxTuition) {
    match.tuitionFee = {
      ...(filters.minTuition != null ? { $gte: filters.minTuition } : {}),
      ...(filters.maxTuition != null ? { $lte: filters.maxTuition } : {}),
    };
  }

  if (filters.minApplicationFee || filters.maxApplicationFee) {
    match.applicationFee = {
      ...(filters.minApplicationFee != null ? { $gte: filters.minApplicationFee } : {}),
      ...(filters.maxApplicationFee != null ? { $lte: filters.maxApplicationFee } : {}),
    };
  }

  if (filters.openIntakeOnly) {
    // shorthand for "only open intakes"
    match.intakes = { $elemMatch: { status: 'open' } };
  }

  if (filters.intakeStatus) {
    match.intakes = {
      ...(match.intakes || {}),
      $elemMatch: { status: { $in: filters.intakeStatus } }
    };
  }

  if (filters.intakeDateFrom || filters.intakeDateTo) {
    const dateQuery: any = {};
    if (filters.intakeDateFrom) dateQuery.$gte = filters.intakeDateFrom;
    if (filters.intakeDateTo)   dateQuery.$lte = filters.intakeDateTo;
    match.intakes = {
      ...(match.intakes || {}),
      $elemMatch: { openDate: dateQuery }
    };
  }

  // 2) If no "location" filter, we can just `.find(match)`
  if (!filters.location) {
    const [docs, total] = await Promise.all([
      programmeModel
        .find({ ...match, published: true })
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      programmeModel.countDocuments({ ...match, published: true }),
    ]);
    return {
      programmes: await Promise.all(docs.map(projectProgramme)),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 3) If you *do* need to filter by university address, use an aggregation:
  const pipeline: any[] = [
    { $match: { ...match, published: true } },

    // join in the university doc
    {
      $lookup: {
        from: 'universities',
        localField: 'universityId',
        foreignField: '_id',
        as: 'university'
      }
    },
    { $unwind: '$university' },

    // apply the location filter against the populated address
    {
      $match: {
        'university.address.country': { $in: filters.location },
      }
    },

    // now paginate & sort
    { $sort: { name: 1 } },
    { $skip: skip },
    { $limit: limit },

    // finally reshape like projectProgramme (or do a second lookup/populate if needed)
    {
      $project: {
        _id: 1,
        universityId: '$university',
        name: 1,
        type: 1,
        description: 1,
        lengthBreakdown: 1,
        deliveryMethod: 1,
        tuitionFee: 1,
        applicationFee: 1,
        otherFees: 1,
        published: 1,
        metaTitle: 1,
        metaDescription: 1,
        metaKeywords: 1,
        intakes: 1,
        programRequirement: 1,
        modules: 1,
        services: 1,
        images: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ];

  const [docs, countResult] = await Promise.all([
    programmeModel.aggregate(pipeline),
    // for total count, run the same match+lookup+location match but end in {$count:"count"}
    programmeModel.aggregate([
      { $match: { ...match, published: true } },
      { $lookup: { from:'universities', localField:'universityId', foreignField:'_id', as:'university' } },
      { $unwind:'$university' },
      { $match:{ 'university.address.country':{ $in: filters.location } } },
      { $count: "count" }
    ])
  ]);

  const total = countResult[0]?.count ?? 0;
  return {
    programmes: await Promise.all(docs.map(projectProgramme)),
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
  // if (filters.universityId) query.universityId = filters.universityId;
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
  const existing = await programmeModel.findOne({
    universityId: dto.universityId,
    name: dto.name,
  });
  if (existing)
    throw new NotFoundError(
      'Programme with same name already exists for this university',
    );
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
