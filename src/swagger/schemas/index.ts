// File: src/swagger/schemas/index.ts

import { authSchemas } from './authSchemas';
import { agentSchemas } from './agentSchemas';
import { healthSchemas } from './healthSchemas';

import { adminAuthSchemas } from './adminAuthSchemas';
import { adminApplicationSchemas } from './adminApplicationSchemas';
import { adminAgentSchemas } from './adminAgentSchemas';
import { adminCompanySchemas } from './adminCompanySchemas';
import { adminProgrammeSchemas } from './adminProgrammeSchemas';
import { adminStudentSchemas } from './adminStudentSchemas';
import { adminUniversitySchemas } from './adminUniversitySchemas';

export const allSchemas = {
  // existing core schemas
  ...authSchemas,
  ...agentSchemas,
  ...healthSchemas,

  // admin schemas
  ...adminAuthSchemas,
  ...adminApplicationSchemas,
  ...adminAgentSchemas,
  ...adminCompanySchemas,
  ...adminProgrammeSchemas,
  ...adminStudentSchemas,
  ...adminUniversitySchemas,
};
