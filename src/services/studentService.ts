import mongoose from 'mongoose';

import StudentModel, {
  Gender,
  IDocument,
  IStudent,
} from '../models/studentModel';
import AgentModel, { IAgent } from '../models/agentModel';
import { NotFoundError } from '../utils/appError';
import userModel from '../models/userModel';
import { uploadFileBufferToS3 } from './s3UploadHelpter';

import { getCountryCode } from '../utils/countryCodeMap';
import { generateStudentId } from '../utils/generateStudentId';
import companyModel from '../models/companyModel';

export const createStudent = async (data: any, agent: IAgent) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      passportNumber,
      documentTypes,
    } = data;

    const company = await companyModel.findById(agent.companyId);
    const fullCountryName = company?.address?.country || '';

    const countryCode = getCountryCode(fullCountryName);
    const studentId = await generateStudentId(countryCode);

    const documentTypesArray = Array.isArray(documentTypes)
      ? documentTypes
      : [documentTypes];

    const education = JSON.parse(data.education || '[]');

    // Step 1: Create user
    const user = await userModel.create(
      [
        {
          email,
          password: 'TempPassword@123',
          role: 'student',
        },
      ],
      { session },
    );

    // Step 2: Create student without documents first
    const student = await StudentModel.create(
      [
        {
          user: user[0]._id,
          agentId: agent._id,
          companyId: agent.companyId,
          firstName,
          lastName,
          gender,
          phone,
          passportNumber,
          education,
          documents: [],
          studentId,
        },
      ],
      { session },
    );

    // Step 3: Upload documents to S3 with studentId as subPath
    const uploadedDocuments: IDocument[] = [];

    const files = Array.isArray(data.files) ? data.files : [];

    await Promise.all(
      files.map(async (file: any, index: number) => {
        const fileUrl = await uploadFileBufferToS3(
          file.buffer,
          file.originalname,
          'students',
          student[0]._id.toString(),
          file.mimetype,
        );

        uploadedDocuments.push({
          type: documentTypesArray[index],
          fileUrl,
        });
      }),
    );

    // Step 4: Update student with uploaded documents
    student[0].documents = uploadedDocuments;
    await student[0].save({ session });

    await session.commitTransaction();
    return student[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const updateStudent = async (id: string, data: any, files: any) => {
  const existing = await StudentModel.findById(id);
  if (!existing) throw new NotFoundError('Student not found');

  const newDocuments = (files || []).map((file: any) => ({
    type: file.fieldname,
    fileUrl: file.location,
    uploadedAt: new Date(),
  }));

  const updated = await StudentModel.findByIdAndUpdate(
    id,
    {
      ...data,
      ...(newDocuments.length
        ? { $push: { documents: { $each: newDocuments } } }
        : {}),
    },
    { new: true },
  );

  return updated;
};

export const deleteStudent = async (id: string) => {
  const student = await StudentModel.findByIdAndDelete(id);
  if (!student) throw new NotFoundError('Student not found');
};

export const getStudentById = async (id: string) => {
  const student = await StudentModel.findById(id).lean();
  if (!student) throw new NotFoundError('Student not found');
  return student;
};

export const listStudents = async (user: any) => {
  const agent = await AgentModel.findOne({ user: user.id });
  if (!agent) throw new NotFoundError('Agent not found');

  if (agent.level === 'owner') {
    return await StudentModel.find({ companyId: agent.companyId }).lean();
  } else if (agent.level === 'manager') {
    const subAgents = await AgentModel.find({ parentId: agent._id });
    const agentIds = subAgents.map((a) => a._id).concat(agent._id);
    return await StudentModel.find({ agentId: { $in: agentIds } }).lean();
  } else {
    return await StudentModel.find({ agentId: agent._id }).lean();
  }
};

/**
 * Filters for admin listing of students
 */
export interface AdminStudentFilters {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  page?: number;
  limit?: number;
  companyId?: string;
}

/**
 * Admin: list students with pagination and filters
 */
export const listStudentsAdmin = async (filters: AdminStudentFilters = {}) => {
  const { firstName, lastName, gender, page = 1, limit = 10, companyId } = filters;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (firstName) query.firstName = new RegExp(firstName, 'i');
  if (lastName) query.lastName = new RegExp(lastName, 'i');
  if (gender) query.gender = gender;
  if (companyId) query.companyId = companyId;

  const [students, total] = await Promise.all([
    StudentModel.find(query).lean().skip(skip).limit(limit),
    StudentModel.countDocuments(query),
  ]);

  return {
    students,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

/**
 * Admin: create a new student under specified agent
 */
export const adminCreateStudent = async (
  data: any,
  files: Express.Multer.File[] = [],
) => {
  const agentId = data.agentId;
  const agent = await AgentModel.findById(agentId);
  if (!agent) throw new NotFoundError('Agent not found');
  const student = await createStudent({ ...data, files }, agent);
  return student;
};

/**
 * Admin: get student by ID
 */
export const adminGetStudentById = async (id: string): Promise<IStudent> => {
  const student = await getStudentById(id);
  if (!student) throw new NotFoundError('Student not found');
  return student;
};

/**
 * Admin: update student by ID
 */
export const adminUpdateStudent = async (
  id: string,
  data: any,
  files: Express.Multer.File[] = [],
) => {
  const updated = await updateStudent(id, data, files);
  if (!updated) throw new NotFoundError('Student not found');
  return updated;
};

/**
 * Admin: delete student by ID
 */
export const adminDeleteStudent = async (id: string) => {
  await deleteStudent(id);
};
