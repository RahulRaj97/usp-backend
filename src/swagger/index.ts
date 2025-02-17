import { OpenAPIV3 } from 'openapi-types';

import { healthSchema } from './schemas/health';
import { healthPath } from './paths/health';

import { agentSchema } from './schemas/agent';
import { agentPath } from './paths/agent';

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
    schemas: {
      Health: healthSchema,
      Agent: agentSchema,
    },
  },
  paths: {
    ...healthPath,
    ...agentPath,
  },
};

export default swaggerDocument;
