// File: src/swagger/schemas/index.ts

import { authSchemas } from './authSchemas';
import { agentSchemas } from './agentSchemas';
import { healthSchemas } from './healthSchemas';
import { applicationSchemas } from './applicationSchemas';
import { programmeSchemas } from './programmeSchemas';

import { adminAdminSchemas } from './adminAdminSchemas';
import { adminAgentSchemas } from './adminAgentSchemas';
import { companySchemas as adminCompanySchemas } from './adminCompanySchemas';
import { adminStudentSchemas } from './adminStudentSchemas';
import { adminUniversitySchemas } from './adminUniversitySchemas';
import { searchSchemas } from './searchSchema';

import { notificationSchemas } from './notificationSchemas';
import { commonSchemas } from './commonSchemas';

export const allSchemas = {
  // existing core schemas
  ...authSchemas,
  ...agentSchemas,
  ...healthSchemas,
  ...applicationSchemas,
  ...programmeSchemas,

  // admin schemas
  ...adminAdminSchemas,
  ...adminAgentSchemas,
  ...adminCompanySchemas,
  ...adminStudentSchemas,
  ...adminUniversitySchemas,

  // search schemas
  ...searchSchemas,

  // notification schemas
  ...notificationSchemas,
  ...commonSchemas,
};
