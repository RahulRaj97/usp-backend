// File: src/swagger/index.ts
import { OpenAPIV3 } from 'openapi-types';

import { authPaths } from './paths/auth';
import { agentPaths } from './paths/agent';
import { healthPaths } from './paths/health';

import { adminAuthPaths } from './paths/adminAuth';
import { adminAgentPaths } from './paths/adminAgent';
import { adminCompanyPaths } from './paths/adminCompanies';
import { adminProgrammePaths } from './paths/adminProgrammes';
import { adminStudentPaths } from './paths/adminStudent';
import { adminUniversityPaths } from './paths/adminUniversity';
import { adminApplicationPaths } from './paths/adminApplications';

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
    // public endpoints
    ...authPaths,
    ...agentPaths,
    ...healthPaths,

    // admin endpoints
    ...adminAuthPaths,
    ...adminAgentPaths,
    ...adminCompanyPaths,
    ...adminProgrammePaths,
    ...adminStudentPaths,
    ...adminUniversityPaths,
    ...adminApplicationPaths,
  },
};

export default swaggerDocument;
