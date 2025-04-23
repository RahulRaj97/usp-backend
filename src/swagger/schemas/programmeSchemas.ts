import { OpenAPIV3 } from 'openapi-types';

export const programmeSchemas: { [key: string]: OpenAPIV3.SchemaObject } = {
  ProgrammeType: {
    type: 'string',
    enum: [
      '3_year_bachelors',
      'advanced_diploma',
      'bachelors',
      'certificate',
      'diploma',
      'doctoral_phd',
      'english',
      'integrated_masters',
      'masters_degree',
      'post_graduate_certificate',
      'post_graduate_diploma',
      'topup_degree',
    ],
  },

  DeliveryMethod: {
    type: 'string',
    enum: ['in_class', 'online', 'blended'],
  },

  GRERequirements: {
    type: 'object',
    properties: {
      required: {
        type: 'string',
        enum: ['none', 'verbal', 'quantitative', 'writing', 'overall'],
      },
      minVerbal: { type: 'number' },
      minQuantitative: { type: 'number' },
      minWriting: { type: 'number' },
      minTotal: { type: 'number' },
    },
  },

  ProgramRequirement: {
    type: 'object',
    properties: {
      englishScoreRequired: { type: 'boolean' },
      minGpa: { type: 'number' },
      otherRequirements: {
        type: 'array',
        items: { type: 'string' },
      },
      minToeflReading: { type: 'number' },
      minToeflWriting: { type: 'number' },
      minToeflListening: { type: 'number' },
      minToeflSpeaking: { type: 'number' },
      minToeflTotal: { type: 'number' },
      minIeltsReading: { type: 'number' },
      minIeltsWriting: { type: 'number' },
      minIeltsListening: { type: 'number' },
      minIeltsSpeaking: { type: 'number' },
      minIeltsAverage: { type: 'number' },
      minIeltsAnyBand: { type: 'number' },
      minIeltsAnyBandCount: { type: 'number' },
      minDuolingoScore: { type: 'number' },
      minDuolingoLiteracyScore: { type: 'number' },
      minDuolingoConversationScore: { type: 'number' },
      minDuolingoComprehensionScore: { type: 'number' },
      minDuolingoProductionScore: { type: 'number' },
      minPteListening: { type: 'number' },
      minPteReading: { type: 'number' },
      minPteSpeaking: { type: 'number' },
      minPteWriting: { type: 'number' },
      minPteOverall: { type: 'number' },
      greRequirements: { $ref: '#/components/schemas/GRERequirements' },
    },
  },

  ProgramIntake: {
    type: 'object',
    properties: {
      openDate: { type: 'string', format: 'date-time' },
      submissionDeadline: { type: 'string', format: 'date-time' },
      available: { type: 'boolean' },
      acceptingNewApps: { type: 'boolean' },
      status: {
        type: 'string',
        enum: ['open', 'closed', 'likely_open'],
      },
      openTime: { type: 'string' },
      deadlineTime: { type: 'string' },
    },
  },

  Programme: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      type: { $ref: '#/components/schemas/ProgrammeType' },
      lengthBreakdown: { type: 'string' },
      deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' },
      tuitionFee: { type: 'number' },
      applicationFee: { type: 'number' },
      otherFees: {
        type: 'array',
        items: { type: 'string' },
      },
      published: { type: 'boolean' },
      metaTitle: { type: 'string' },
      metaDescription: { type: 'string' },
      metaKeywords: {
        type: 'array',
        items: { type: 'string' },
      },
      intakes: {
        type: 'array',
        items: { $ref: '#/components/schemas/ProgramIntake' },
      },
      requirement: {
        oneOf: [
          { $ref: '#/components/schemas/ProgramRequirement' },
          { nullable: true },
        ],
      },
      modules: {
        type: 'array',
        items: { type: 'string' },
      },
      services: {
        type: 'array',
        items: { type: 'string' },
      },
      images: {
        type: 'array',
        items: { type: 'string', format: 'uri' },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      university: { $ref: '#/components/schemas/University' },
    },
  },

  CreateProgrammePayload: {
    type: 'object',
    required: ['universityId', 'name', 'type', 'lengthBreakdown'],
    properties: {
      university: { $ref: '#/components/schemas/University' },
      name: { type: 'string' },
      description: { type: 'string' },
      type: { $ref: '#/components/schemas/ProgrammeType' },
      lengthBreakdown: { type: 'string' },
      deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' },
      tuitionFee: { type: 'number' },
      applicationFee: { type: 'number' },
      otherFees: { type: 'array', items: { type: 'string' } },
      published: { type: 'boolean' },
      metaTitle: { type: 'string' },
      metaDescription: { type: 'string' },
      metaKeywords: { type: 'array', items: { type: 'string' } },
      intakes: {
        type: 'array',
        items: { $ref: '#/components/schemas/ProgramIntake' },
      },
      programRequirement: {
        $ref: '#/components/schemas/ProgramRequirement',
      },
      modules: { type: 'array', items: { type: 'string' } },
      services: { type: 'array', items: { type: 'string' } },
      images: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
        description: 'One or more image files',
      },
    },
  },

  UpdateProgrammePayload: {
    type: 'object',
    required: [],
    properties: {
      university: { $ref: '#/components/schemas/University' },
      name: { type: 'string' },
      description: { type: 'string' },
      type: { $ref: '#/components/schemas/ProgrammeType' },
      lengthBreakdown: { type: 'string' },
      deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' },
      tuitionFee: { type: 'number' },
      applicationFee: { type: 'number' },
      otherFees: { type: 'array', items: { type: 'string' } },
      published: { type: 'boolean' },
      metaTitle: { type: 'string' },
      metaDescription: { type: 'string' },
      metaKeywords: { type: 'array', items: { type: 'string' } },
      intakes: {
        type: 'array',
        items: { $ref: '#/components/schemas/ProgramIntake' },
      },
      programRequirement: {
        $ref: '#/components/schemas/ProgramRequirement',
      },
      modules: { type: 'array', items: { type: 'string' } },
      services: { type: 'array', items: { type: 'string' } },
      images: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
        description: 'One or more image files',
      },
    },
  },

  PaginatedProgrammes: {
    type: 'object',
    properties: {
      programmes: {
        type: 'array',
        items: { $ref: '#/components/schemas/Programme' },
      },
      totalPages: { type: 'integer' },
      currentPage: { type: 'integer' },
    },
  },
};
