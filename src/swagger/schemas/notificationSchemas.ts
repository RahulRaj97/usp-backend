// File: src/swagger/schemas/notificationSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const notificationSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  Notification: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
      recipient: { type: 'string', example: '60d0fe4f5311236168a109cb' },
      actor: { type: 'string', example: '60d0fe4f5311236168a109cc' },
      type: {
        type: 'string',
        enum: ['info', 'success', 'warning', 'error'],
        example: 'info',
      },
      title: { type: 'string', example: 'Application Updated' },
      message: {
        type: 'string',
        example: 'Your application status changed to submitted_to_university',
      },
      data: {
        type: 'object',
        additionalProperties: true,
        example: { applicationId: '60d0fe4f5311236168a109cd' },
      },
      isRead: { type: 'boolean', example: false },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-19T12:00:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-19T12:05:00Z',
      },
    },
  },

  PaginatedNotifications: {
    type: 'object',
    properties: {
      notifications: {
        type: 'array',
        items: { $ref: '#/components/schemas/Notification' },
      },
      totalPages: { type: 'integer', example: 3 },
      currentPage: { type: 'integer', example: 1 },
    },
  },
};
