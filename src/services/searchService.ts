// src/services/searchService.ts

import ProgrammeModel from '../models/programmeModel';
import StudentModel from '../models/studentModel';
import AgentModel from '../models/agentModel';
import { NotFoundError } from '../utils/appError';
import { getAgentByUserId } from './agentService';

/**
 * Searches programmes (no restriction), students, and applications
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
    $or: [
      { name: regex },
      { description: regex },
      { tuitionFee: regex },
      { modules: regex },
    ],
  }).lean();

  // -------------------------------------------------------
  // Set up base queries for Students and Applications
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
    // If owner: no restrictions on students or applications
  } else {
    // Fallback, if role is not recognized, return no results.
    studentsQuery = { _id: null };
  }

  // -------------------------------------------------------
  // Add search filters to Students query.
  // For students, we’ll search in firstName, lastName, and studentId.
  // -------------------------------------------------------
  const studentSearchCriteria = {
    $or: [{ firstName: regex }, { lastName: regex }, { studentId: regex }],
  };

  // Merge any existing agent-based restrictions with the search criteria
  if (Object.keys(studentsQuery).length > 0) {
    studentsQuery = { $and: [studentsQuery, studentSearchCriteria] };
  } else {
    studentsQuery = studentSearchCriteria;
  }

  // -------------------------------------------------------
  // Perform queries in parallel
  // -------------------------------------------------------
  const [students] = await Promise.all([
    StudentModel.find(studentsQuery).lean(),
  ]);

  // Return an object containing all search results
  return {
    programmes,
    students,
  };
};
