// src/services/searchService.ts

import ProgrammeModel from '../models/programmeModel';
import StudentModel from '../models/studentModel';
import AgentModel from '../models/agentModel';
import { NotFoundError } from '../utils/appError';
import { getAgentByUserId } from './agentService';
import userModel from '../models/userModel';
import universityModel from '../models/universityModel';
import companyModel from '../models/companyModel';

/**
 * Searches programmes (no restriction) and students
 * using the provided keyword and applies level restrictions.
 *
 * @param keyword - The search keyword.
 * @param user - The authenticated user (from req.user)
 */
export const searchAll = async (keyword: string, user: any) => {
  // Build a case-insensitive regex from the keyword
  const regex = new RegExp(keyword, 'i');

  // -----------------------------------------------
  // Search in Programmes (no role restrictions)
  // -----------------------------------------------
  const programmes = await ProgrammeModel.find({
    $or: [{ name: regex }, { description: regex }, { modules: regex }],
  })
    .limit(10)
    .lean();

  // -------------------------------------------------------
  // Set up base query for Students (apply agent restriction)
  // -------------------------------------------------------
  let studentsQuery: Record<string, any> = {};

  // If user is admin, assume full access (you can add this case if required)
  if (user.role === 'admin') {
    // No additional restrictions for admin
  } else if (user.role === 'agent') {
    // Get the agent details
    const agent = await getAgentByUserId(user.id);
    if (!agent) throw new NotFoundError('Agent not found');

    if (agent.level === 'admission' || agent.level === 'counsellor') {
      // Only their own records
      studentsQuery = { agentId: agent._id };
    } else if (agent.level === 'manager') {
      // Manager: include records by themselves and sub-agents under them
      const subAgents = await AgentModel.find({ parentId: agent._id }).lean();
      const agentIds = subAgents.map((a) => a._id);
      agentIds.push(agent._id); // include self
      studentsQuery = { agentId: { $in: agentIds } };
    }
    // Owners have full access so no restrictions are added.
  } else {
    // Fallback: if role is not recognized, return no results.
    studentsQuery = { _id: null };
  }

  // Add search filters for Students, searching in firstName, lastName, and studentId
  const studentSearchCriteria = {
    $or: [{ firstName: regex }, { lastName: regex }, { studentId: regex }],
  };

  // Merge the agent-based restrictions with the search criteria
  if (Object.keys(studentsQuery).length > 0) {
    studentsQuery = { $and: [studentsQuery, studentSearchCriteria] };
  } else {
    studentsQuery = studentSearchCriteria;
  }

  // -------------------------------------------------------
  // Execute Students query with a limit of 10 results
  // -------------------------------------------------------
  const [students] = await Promise.all([
    StudentModel.find(studentsQuery).limit(10).lean(),
  ]);

  return {
    programmes,
    students,
  };
};

/**
 * Helper: find any User._id whose email matches the keyword.
 */
async function findMatchingStudentUserIds(keyword: string) {
  if (!keyword) return [];
  const regex = new RegExp(keyword, 'i');
  const users = await userModel.find({ email: regex }).select('_id').lean();
  return users.map((u) => u._id);
}

/**
 * Admin search: programmes, universities, companies, students, agents.
 */
export const searchAllAdmin = async (keyword: string) => {
  const regex = new RegExp(keyword, 'i');

  // pre-find student-emails
  const matchingStudentUserIds = await findMatchingStudentUserIds(keyword);

  const [programmes, universities, companies, students, agents] =
    await Promise.all([
      // Programmes
      ProgrammeModel.find({
        $or: [{ name: regex }, { description: regex }, { modules: regex }],
      }).lean(),
      // Universities
      universityModel
        .find({
          $or: [
            { name: regex },
            { website: regex },
            { description: regex },
            { 'address.city': regex },
            { 'address.country': regex },
          ],
        })
        .lean(),
      // Companies
      companyModel
        .find({
          $or: [
            { name: regex },
            { website: regex },
            { ntn: regex },
            { 'address.city': regex },
            { 'address.country': regex },
          ],
        })
        .lean(),
      // Students (unrestricted)
      StudentModel.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { studentId: regex },
          ...(matchingStudentUserIds.length
            ? [{ user: { $in: matchingStudentUserIds } }]
            : []),
        ],
      }).lean(),
      // Agents (unrestricted)
      AgentModel.find({
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
      }).lean(),
    ]);

  return { programmes, universities, companies, students, agents };
};
