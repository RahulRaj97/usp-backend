import { NotFoundError } from '../utils/appError';
import programmeModel, { IProgramme } from '../models/programmeModel';
import { uploadFileBufferToS3 } from './s3UploadHelpter';

interface ProgrammeFilterParams {
  programmeType: string[];
  courseOfStudy: string[];
  location: string[];
}

export const createProgramme = async (
  data: any,
  imageFiles?: Express.Multer.File[],
): Promise<IProgramme> => {
  const images: string[] = [];

  const programme = await programmeModel.create({
    universityId: data.universityId,
    name: data.name,
    description: data.description,
    type: data.type,
    subjectArea: data.subjectArea,
    durationSemesters: data.durationSemesters,
    startDate: data.startDate,
    endDate: data.endDate,
    tuitionFee: data.tuitionFee,
    modules: data.modules,
    entryRequirements: data.entryRequirements,
    services: data.services,
  });

  if (imageFiles && imageFiles.length > 0) {
    for (const file of imageFiles) {
      const imageUrl = await uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        'programmes',
        programme.id,
        file.mimetype,
      );
      images.push(imageUrl);
    }
    programme.images = images;
    await programme.save();
  }

  return programme;
};

export const getAllProgrammes = async (
  filters: ProgrammeFilterParams,
): Promise<IProgramme[]> => {
  const matchStage: any = {};

  if (filters.programmeType.length > 0) {
    matchStage.type = { $in: filters.programmeType };
  }

  if (filters.courseOfStudy.length > 0) {
    matchStage.subjectArea = { $in: filters.courseOfStudy };
  }

  const pipeline: any[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'universities',
        localField: 'universityId',
        foreignField: '_id',
        as: 'university',
      },
    },
    { $unwind: '$university' },
  ];

  if (filters.location.length > 0) {
    pipeline.push({
      $match: {
        'university.address.country': {
          $in: filters.location.map((loc) => new RegExp(`^${loc}$`, 'i')),
        },
      },
    });
  }

  return await programmeModel.aggregate(pipeline);
};

export const getProgrammeById = async (
  id: string,
): Promise<IProgramme | null> => {
  return await programmeModel.findById(id).lean();
};

export const updateProgramme = async (
  id: string,
  data: any,
  imageFiles?: Express.Multer.File[],
): Promise<IProgramme | null> => {
  const updateData: any = {
    ...data,
    modules: JSON.parse(data.modules || '[]'),
    entryRequirements: JSON.parse(data.entryRequirements || '[]'),
    services: JSON.parse(data.services || '[]'),
  };

  if (imageFiles && imageFiles.length > 0) {
    const images: string[] = [];
    for (const file of imageFiles) {
      const imageUrl = await uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        'programmes',
        id,
        file.mimetype,
      );
      images.push(imageUrl);
    }
    updateData.images = images;
  }

  return await programmeModel.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteProgramme = async (id: string): Promise<void> => {
  await programmeModel.findByIdAndDelete(id);
};

interface ProgrammeFilter {
  type?: string;
  subjectArea?: string;
  durationSemesters?: number;
  minDuration?: number;
  maxDuration?: number;
  startDate?: Date;
  universityId?: string;
}

export const listProgrammes = async (
  filters: ProgrammeFilter,
): Promise<IProgramme[]> => {
  const query: any = {};

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.subjectArea) {
    query.subjectArea = filters.subjectArea;
  }

  if (filters.universityId) {
    query.universityId = filters.universityId;
  }

  if (filters.durationSemesters) {
    query.durationSemesters = filters.durationSemesters;
  } else if (filters.minDuration || filters.maxDuration) {
    query.durationSemesters = {};
    if (filters.minDuration) query.durationSemesters.$gte = filters.minDuration;
    if (filters.maxDuration) query.durationSemesters.$lte = filters.maxDuration;
  }

  if (filters.startDate) {
    query.startDate = { $gte: filters.startDate };
  }

  return await programmeModel.find(query);
};

/** DTO for admin create/update */
export interface AdminProgrammeDto {
  universityId: string;
  name: string;
  description?: string;
  type: string;
  subjectArea: string;
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
}

/** Admin: create programme */
export const adminCreateProgramme = async (
  data: AdminProgrammeDto,
  imageFiles?: Express.Multer.File[],
): Promise<IProgramme> => {
  // reuse existing logic
  const programme = await createProgramme(data, imageFiles);
  return programme;
};

/** Admin: list programmes with same filters as public GET /api/programmes :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1} */
export interface AdminProgrammeFilters {
  universityId?: string;
  type?: string;
  subjectArea?: string;
  startDate?: Date;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  limit?: number;
}
export const listProgrammesAdmin = async (
  filters: AdminProgrammeFilters = {},
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  // build same query as listProgrammes, plus pagination
  const query: any = {};
  if (filters.universityId) query.universityId = filters.universityId;
  if (filters.type) query.type = filters.type;
  if (filters.subjectArea) query.subjectArea = filters.subjectArea;
  if (filters.minDuration || filters.maxDuration) {
    query.durationSemesters = {};
    if (filters.minDuration) query.durationSemesters.$gte = filters.minDuration;
    if (filters.maxDuration) query.durationSemesters.$lte = filters.maxDuration;
  }
  if (filters.startDate) {
    query.startDate = { $gte: filters.startDate };
  }

  const [items, total] = await Promise.all([
    programmeModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    programmeModel.countDocuments(query),
  ]);

  return {
    programmes: items,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

/** Admin: get one programme */
export const adminGetProgrammeById = async (
  id: string,
): Promise<IProgramme> => {
  const prog = await getProgrammeById(id);
  if (!prog) throw new NotFoundError('Programme not found');
  return prog;
};

/** Admin: update programme */
export const adminUpdateProgramme = async (
  id: string,
  data: Partial<AdminProgrammeDto>,
  imageFiles?: Express.Multer.File[],
): Promise<IProgramme> => {
  const updated = await updateProgramme(id, data, imageFiles);
  if (!updated) throw new NotFoundError('Programme not found');
  return updated;
};

/** Admin: delete programme */
export const adminDeleteProgramme = async (id: string): Promise<void> => {
  const doc = await programmeModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Programme not found');
};
