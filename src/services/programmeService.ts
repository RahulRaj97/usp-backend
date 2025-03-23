import programmeModel, { IProgramme } from '../models/programmeModel';
import { uploadFileBufferToS3 } from './s3UploadHelpter';

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

  console.log(programme);

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

export const getAllProgrammes = async (): Promise<IProgramme[]> => {
  return await programmeModel.find().lean();
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
