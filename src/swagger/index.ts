import { OpenAPIV3 } from 'openapi-types';

import { authPaths } from './paths/auth';
import { agentPaths } from './paths/agent';
import { healthPaths } from './paths/health';
import { allSchemas } from './schemas';

const swaggerDocument: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Universal Study Portal API',
    version: '1.0.0',
    description: 'API documentation for the Universal Study Portal Backend',
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
  },
};

export default swaggerDocument;
