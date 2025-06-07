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
  type?: ProgrammeType[]; // multi-select programme types
  deliveryMethod?: DeliveryMethod[]; // multi-select delivery methods
  location?: string[]; // city or country codes from university.address
  intakeStatus?: IProgramIntake['status'][]; // e.g. ['open','likely_open']
  intakeDateFrom?: Date; // lower bound on intake.openDate
  intakeDateTo?: Date; // upper bound on intake.openDate
  minTuition?: number;
  maxTuition?: number;
  minApplicationFee?: number;
  maxApplicationFee?: number;
  openIntakeOnly?: boolean; // shorthand for status=open
  page?: number;
  limit?: number;
  universityId?: string;
}

export interface AdminProgrammeFilters extends AgentProgrammeFilters {
  published?: boolean;
  country?: string[]; // Add country filter
  intakeDateFrom?: Date; // Add intake date range filters
  intakeDateTo?: Date;
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
  // Operation fields
  imageOperations?: {
    remove?: string[];
    reorder?: string[];
  };
  arrayOperations?: {
    otherFees?: { remove?: string[]; add?: string[] };
    metaKeywords?: { remove?: string[]; add?: string[] };
    modules?: { remove?: string[]; add?: string[] };
    services?: { remove?: string[]; add?: string[] };
  };
  intakeOperations?: {
    remove?: number[]; // Array of intake indices to remove
    update?: Array<{
      index: number; // Index of the intake to update
      updates: Partial<IProgramIntake>;
    }>;
    add?: IProgramIntake[];
  };
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
  const uni = doc.universityId?.toObject
    ? doc.universityId.toObject()
    : doc.universityId;
  
  // Convert ObjectId to string
  uni.id = uni._id?.toString() || uni._id;
  delete uni._id;
  delete uni.__v;
  
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id?.toString() || o._id,
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

  // 1) Build the "match" object for Programme fields:
  const match: FilterQuery<IProgramme> = { published: true };

  if (filters.search) {
    // Escape special characters in the search string
    const escapedSearch = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escapedSearch, 'i');
    match.$or = [{ name: re }];
  }

  if (filters.universityId) {
    console.log('Filtering by universityId:', filters.universityId);
    match.universityId = filters.universityId;
  }

  if (filters.type) match.type = { $in: filters.type };
  if (filters.deliveryMethod)
    match.deliveryMethod = { $in: filters.deliveryMethod };

  if (filters.minTuition || filters.maxTuition) {
    match.tuitionFee = {
      ...(filters.minTuition != null ? { $gte: filters.minTuition } : {}),
      ...(filters.maxTuition != null ? { $lte: filters.maxTuition } : {}),
    };
  }

  if (filters.minApplicationFee || filters.maxApplicationFee) {
    match.applicationFee = {
      ...(filters.minApplicationFee != null
        ? { $gte: filters.minApplicationFee }
        : {}),
      ...(filters.maxApplicationFee != null
        ? { $lte: filters.maxApplicationFee }
        : {}),
    };
  }

  if (filters.openIntakeOnly) {
    // shorthand for "only open intakes"
    match.intakes = { $elemMatch: { status: 'open' } };
  }

  if (filters.intakeStatus) {
    match.intakes = {
      ...(match.intakes || {}),
      $elemMatch: { status: { $in: filters.intakeStatus } },
    };
  }

  if (filters.intakeDateFrom || filters.intakeDateTo) {
    const dateQuery: any = {};
    if (filters.intakeDateFrom) {
      // Set time to start of day
      const fromDate = new Date(filters.intakeDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      dateQuery.$gte = fromDate;
    }
    if (filters.intakeDateTo) {
      // Set time to end of day
      const toDate = new Date(filters.intakeDateTo);
      toDate.setHours(23, 59, 59, 999);
      dateQuery.$lte = toDate;
    }
    match.intakes = {
      ...(match.intakes || {}),
      $elemMatch: { openDate: dateQuery },
    };
  }

  // 2) If no "location" filter, we can just `.find(match)`
  if (!filters.location) {
    const [docs, total] = await Promise.all([
      programmeModel.find(match).skip(skip).limit(limit).sort({ name: 1 }),
      programmeModel.countDocuments(match),
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
        as: 'university',
      },
    },
    { $unwind: '$university' },

    // apply the location filter against the populated address
    {
      $match: {
        'university.address.country': { $in: filters.location },
      },
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
        updatedAt: 1,
      },
    },
  ];

  const [docs, countResult] = await Promise.all([
    programmeModel.aggregate(pipeline),
    // for total count, run the same match+lookup+location match but end in {$count:"count"}
    programmeModel.aggregate([
      { $match: { ...match, published: true } },
      {
        $lookup: {
          from: 'universities',
          localField: 'universityId',
          foreignField: '_id',
          as: 'university',
        },
      },
      { $unwind: '$university' },
      { $match: { 'university.address.country': { $in: filters.location } } },
      { $count: 'count' },
    ]),
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
  if (filters.universityId) query.universityId = filters.universityId;
  if (filters.type) query.type = Array.isArray(filters.type) ? { $in: filters.type } : filters.type;
  if (filters.deliveryMethod) query.deliveryMethod = Array.isArray(filters.deliveryMethod) ? { $in: filters.deliveryMethod } : filters.deliveryMethod;
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

  // Add intake date range filters
  if (filters.intakeDateFrom || filters.intakeDateTo) {
    const dateQuery: any = {};
    if (filters.intakeDateFrom) {
      // Set time to start of day
      const fromDate = new Date(filters.intakeDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      dateQuery.$gte = fromDate;
    }
    if (filters.intakeDateTo) {
      // Set time to end of day
      const toDate = new Date(filters.intakeDateTo);
      toDate.setHours(23, 59, 59, 999);
      dateQuery.$lte = toDate;
    }
    query.intakes = {
      ...(query.intakes || {}),
      $elemMatch: { openDate: dateQuery },
    };
  }

  // If no country filter, we can just use find()
  if (!filters.country) {
    console.log('Using find() with query:', JSON.stringify(query, null, 2));
    const [docs, total] = await Promise.all([
      programmeModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .populate('universityId', 'name logo website'),
      programmeModel.countDocuments(query),
    ]);
    console.log('Found documents:', docs.length, 'Total:', total);

    return {
      programmes: await Promise.all(docs.map((d) => projectProgramme(d))),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // If country filter is present, use aggregation pipeline
  const pipeline: any[] = [
    { $match: query },
    {
      $lookup: {
        from: 'universities',
        localField: 'universityId',
        foreignField: '_id',
        as: 'university',
      },
    },
    { $unwind: '$university' },
    {
      $match: {
        'university.address.country': { $in: Array.isArray(filters.country) ? filters.country : [filters.country] },
      },
    },
    // Add pagination and sorting
    { $sort: { name: 1 } },
    { $skip: skip },
    { $limit: limit },
    // Project fields and convert ObjectIds to strings
    {
      $project: {
        _id: { $toString: '$_id' },
        university: {
          _id: { $toString: '$university._id' },
          name: '$university.name',
          logo: '$university.logo',
          website: '$university.website',
          address: '$university.address'
        },
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

  // Get total count
  const countPipeline = [
    ...pipeline.slice(0, -4), // Remove pagination and projection stages
    { $count: 'count' },
  ];

  const [docs, countResult] = await Promise.all([
    programmeModel.aggregate(pipeline),
    programmeModel.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.count ?? 0;

  // No need to call projectProgramme since we've already formatted the data
  return {
    programmes: docs.map(doc => ({
      id: doc._id,
      university: doc.university,
      name: doc.name,
      type: doc.type,
      description: doc.description,
      lengthBreakdown: doc.lengthBreakdown,
      deliveryMethod: doc.deliveryMethod,
      tuitionFee: doc.tuitionFee,
      applicationFee: doc.applicationFee,
      otherFees: doc.otherFees,
      published: doc.published,
      metaTitle: doc.metaTitle,
      metaDescription: doc.metaDescription,
      metaKeywords: doc.metaKeywords,
      intakes: doc.intakes,
      programRequirement: doc.programRequirement,
      modules: doc.modules,
      services: doc.services,
      images: doc.images,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    })),
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
    'published',
    'metaTitle',
    'metaDescription',
    'programRequirement',
  ] as (keyof AdminUpdateProgrammeDto)[]) {
    if (dto[field] !== undefined) {
      // @ts-ignore
      prog[field] = dto[field] as any;
    }
  }

  // Handle array operations
  if (dto.arrayOperations) {
    const { otherFees, metaKeywords, modules, services } = dto.arrayOperations;

    if (otherFees) {
      prog.otherFees = [
        ...prog.otherFees.filter(fee => !otherFees.remove?.includes(fee)),
        ...(otherFees.add || [])
      ];
    }

    if (metaKeywords) {
      prog.metaKeywords = [
        ...prog.metaKeywords.filter(keyword => !metaKeywords.remove?.includes(keyword)),
        ...(metaKeywords.add || [])
      ];
    }

    if (modules) {
      prog.modules = [
        ...prog.modules.filter(module => !modules.remove?.includes(module)),
        ...(modules.add || [])
      ];
    }

    if (services) {
      prog.services = [
        ...prog.services.filter(service => !services.remove?.includes(service)),
        ...(services.add || [])
      ];
    }
  }

  // Handle intake operations
  if (dto.intakeOperations) {
    const { remove, update, add } = dto.intakeOperations;

    // Remove intakes by index
    if (remove?.length) {
      // Sort indices in descending order to avoid index shifting
      const sortedIndices = [...remove].sort((a, b) => b - a);
      for (const index of sortedIndices) {
        if (index >= 0 && index < prog.intakes.length) {
          prog.intakes.splice(index, 1);
        }
      }
    }

    // Update existing intakes by index
    if (update?.length) {
      for (const { index, updates } of update) {
        if (index >= 0 && index < prog.intakes.length) {
          prog.intakes[index] = {
            ...prog.intakes[index],
            ...updates
          };
        }
      }
    }

    // Add new intakes
    if (add?.length) {
      prog.intakes.push(...add);
    }
  }

  // Handle image operations
  if (dto.imageOperations) {
    const { remove, reorder } = dto.imageOperations;

    // Remove images
    if (remove?.length) {
      prog.images = prog.images.filter(img => !remove.includes(img));
    }

    // Reorder images
    if (reorder?.length) {
      const imageMap = new Map(prog.images.map(img => [img, img]));
      prog.images = reorder
        .filter(img => imageMap.has(img))
        .map(img => imageMap.get(img)!);
    }
  }

  // Add new images
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
