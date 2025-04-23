// File: src/swagger/schemas/index.ts

import { authSchemas } from './authSchemas';
import { agentSchemas } from './agentSchemas';
import { healthSchemas } from './healthSchemas';
import { applicationSchemas } from './applicationSchemas';

import { adminAdminSchemas } from './adminAdminSchemas';
import { adminAgentSchemas } from './adminAgentSchemas';
import { companySchemas as adminCompanySchemas } from './adminCompanySchemas';
import { adminProgrammeSchemas } from './adminProgrammeSchemas';
import { adminStudentSchemas } from './adminStudentSchemas';
import { adminUniversitySchemas } from './adminUniversitySchemas';
import { searchSchemas } from './searchSchema';

import { notificationSchemas } from './notificationSchemas';

export const allSchemas = {
  // existing core schemas
  ...authSchemas,
  ...agentSchemas,
  ...healthSchemas,
  ...applicationSchemas,

  // admin schemas
  ...adminAdminSchemas,
  ...adminAgentSchemas,
  ...adminCompanySchemas,
  ...adminProgrammeSchemas,
  ...adminStudentSchemas,
  ...adminUniversitySchemas,

  // search schemas
  ...searchSchemas,

  // notification schemas
  ...notificationSchemas,
};
