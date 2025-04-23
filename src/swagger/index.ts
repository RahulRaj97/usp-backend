// File: src/swagger/index.ts
import { OpenAPIV3 } from 'openapi-types';

import { authPaths } from './paths/auth';
import { agentPaths } from './paths/agent';
import { healthPaths } from './paths/health';
import { applicationPaths } from './paths/application';
import { programmePaths } from './paths/programme';

import { adminAdminPaths } from './paths/adminAdmin';
import { adminAgentPaths } from './paths/adminAgent';
import { adminCompanyPaths } from './paths/adminCompanies';
import { adminProgrammePaths } from './paths/adminProgrammes';
import { adminStudentPaths } from './paths/adminStudent';
import { adminUniversityPaths } from './paths/adminUniversity';
import { adminApplicationPaths } from './paths/adminApplications';

import { searchPaths } from './paths/search';
import { notificationPaths } from './paths/notification';

import { allSchemas } from './schemas';

const swaggerDocument: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Universal Study Portal API',
    version: '1.0.0',
    description:
      'API documentation for the Universal Study Portal Backend, including admin endpoints',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: allSchemas,
  },
  security: [{ BearerAuth: [] }],
  paths: {
    ...authPaths,
    ...agentPaths,
    ...healthPaths,
    ...applicationPaths,
    ...programmePaths,

    // admin endpoints
    ...adminAdminPaths,
    ...adminAgentPaths,
    ...adminCompanyPaths,
    ...adminProgrammePaths,
    ...adminStudentPaths,
    ...adminUniversityPaths,
    ...adminApplicationPaths,

    // search endpoints
    ...searchPaths,

    // notification endpoints
    ...notificationPaths,
  },
};

export default swaggerDocument;
