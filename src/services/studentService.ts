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
import { IUser } from '../models/userModel';

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await getStudentById(id);
    if (!student) throw new NotFoundError('Student not found');

    const studentUser = await userModel.findById(student.user._id);

    if(!studentUser) throw new NotFoundError('User not found');

    // Update user details if provided
    if (data.address || data.profileImage) {
      const userUpdates: any = {};
      if (data.email) userUpdates.email = data.email;
      
      // Handle address updates
      if (data.address) {
        let addressData;
        try {
          // Parse address if it's a string
          if (typeof data.address === 'string') {
            try {
              addressData = JSON.parse(data.address);
            } catch (parseError) {
              console.error('Address parse error:', parseError);
              throw new Error('Invalid address JSON format');
            }
          } else {
            addressData = data.address;
          }

          // Validate address data structure
          if (!addressData || typeof addressData !== 'object') {
            throw new Error('Address must be an object');
          }

          // Update address using dot notation
          const updateResult = await userModel.updateOne(
            { _id: studentUser._id },
            {
              $set: {
                'address.street': addressData.street || '',
                'address.city': addressData.city || '',
                'address.state': addressData.state || '',
                'address.postalCode': addressData.zipCode || addressData.postalCode || '',
                'address.country': addressData.country || '',
              }
            },
            { session }
          );

          if (updateResult.modifiedCount === 0) {
            throw new Error('Failed to update address');
          }
        } catch (error: any) {
          console.error('Address update error:', error);
          throw new Error(`Address update failed: ${error?.message || 'Unknown error'}`);
        }
      }
      
      // Handle profile image upload
      if (data.profileImage && data.profileImage.buffer) {
        const profileImageUrl = await uploadFileBufferToS3(
          data.profileImage.buffer,
          data.profileImage.originalname,
          'profile-images',
          student._id.toString(),
          data.profileImage.mimetype,
        );
        userUpdates.profileImage = profileImageUrl;
      } else if (data.profileImage) {
        userUpdates.profileImage = data.profileImage;
      }
      
      // Update other user fields if any
      if (Object.keys(userUpdates).length > 0) {
        await userModel.findByIdAndUpdate(
          studentUser._id,
          { $set: userUpdates },
          { session }
        );
      }
    }

    // Handle education records
    if (data.education) {
      try {
        // Parse education if it's a string
        const educationData = typeof data.education === 'string' 
          ? JSON.parse(data.education) 
          : data.education;

        // Ensure it's an array
        const education = Array.isArray(educationData) 
          ? educationData 
          : [educationData];

        // Validate each education entry
        education.forEach((edu: any) => {
          if (!edu.institutionName || !edu.degree || !edu.year) {
            throw new Error('Education entries must include institutionName, degree, and year');
          }
        });

        // Update education using findByIdAndUpdate
        await StudentModel.findByIdAndUpdate(
          student._id,
          { $set: { education } },
          { session }
        );
      } catch (error) {
        throw new Error('Invalid education data format');
      }
    }

    // Handle documents
    if (files?.documents && files.documents.length > 0) {
      const documentTypes = Array.isArray(data.documentTypes) 
        ? data.documentTypes 
        : [data.documentTypes];

      if (documentTypes.length !== files.documents.length) {
        throw new Error('Number of document types must match number of files');
      }

      const uploadedDocuments = await Promise.all(
        files.documents.map(async (file: any, index: number) => {
          const fileUrl = await uploadFileBufferToS3(
            file.buffer,
            file.originalname,
            'students',
            student._id.toString(),
            file.mimetype,
          );
          return {
            type: documentTypes[index],
            fileUrl,
            uploadedAt: new Date(),
          };
        }),
      );

      // Update student with new documents using findByIdAndUpdate
      await StudentModel.findByIdAndUpdate(
        student._id,
        {
          $push: {
            documents: {
              $each: uploadedDocuments
            }
          }
        },
        { session }
      );
    }

    // Remove documents if specified
    let removeDocuments: string[] = [];
    if (data.removeDocuments) {
      try {
        // Handle both string and array formats
        removeDocuments = typeof data.removeDocuments === 'string' 
          ? JSON.parse(data.removeDocuments)
          : data.removeDocuments;
      } catch (error) {
        console.error('Error parsing removeDocuments:', error);
        throw new Error('Invalid removeDocuments format');
      }
    }

    if (removeDocuments.length > 0) {
      // Convert string IDs to ObjectIds for comparison
      const removeIds = removeDocuments.map((id: string) => new mongoose.Types.ObjectId(id));
      
      // Update the documents array by filtering out the specified documents
      await StudentModel.findByIdAndUpdate(
        student._id,
        {
          $pull: {
            documents: {
              _id: { $in: removeIds }
            }
          }
        },
        { session }
      );
    }

    // Update student basic details
    const studentUpdates: Partial<IStudent> = {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      phone: data.phone,
      passportNumber: data.passportNumber,
      passportExpiry: data.passportExpiry,
      profileStatus: data.profileStatus,
    };

    // Remove undefined values
    Object.keys(studentUpdates).forEach((key) => {
      if (studentUpdates[key as keyof typeof studentUpdates] === undefined) {
        delete studentUpdates[key as keyof typeof studentUpdates];
      }
    });

    // Update student using findByIdAndUpdate instead of save
    await StudentModel.findByIdAndUpdate(
      student._id,
      { $set: studentUpdates },
      { session }
    );

    await session.commitTransaction();

    // Fetch the updated student with populated user data
    const updatedStudent = await StudentModel.findById(id)
      .populate<{ user: IUser }>('user')
      .lean();

    if (!updatedStudent) {
      throw new Error('Failed to fetch updated student data');
    }

    return updatedStudent;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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
  const {
    firstName,
    lastName,
    gender,
    page = 1,
    limit = 10,
    companyId,
  } = filters;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (firstName) query.firstName = new RegExp(firstName, 'i');
  if (lastName) query.lastName = new RegExp(lastName, 'i');
  if (gender) query.gender = gender;
  if (companyId) query.companyId = companyId;

  const [students, total] = await Promise.all([
    StudentModel.find(query)
      .populate('companyId')
      .populate('agentId')
      .lean()
      .skip(skip)
      .limit(limit),
    StudentModel.countDocuments(query),
  ]);

  // Transform the response to rename the fields
  const transformedStudents = students.map(student => ({
    ...student,
    company: student.companyId,
    agent: student.agentId,
    companyId: undefined,
    agentId: undefined
  }));

  return {
    students: transformedStudents,
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
