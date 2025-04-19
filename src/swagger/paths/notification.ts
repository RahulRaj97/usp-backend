// File: src/swagger/paths/notification.ts
import { OpenAPIV3 } from 'openapi-types';

export const notificationPaths: OpenAPIV3.PathsObject = {
  '/api/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'List Notifications',
      description:
        'Retrieve paginated notifications for the authenticated user',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', default: 1 },
          description: 'Page number (default 1)',
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 20 },
          description: 'Items per page (default 20)',
        },
      ],
      responses: {
        200: {
          description: 'Paginated list of notifications',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedNotifications' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/notifications/{id}/read': {
    put: {
      tags: ['Notifications'],
      summary: 'Mark Notification as Read',
      description: 'Mark a single notification as read',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Notification ID',
        },
      ],
      responses: {
        200: {
          description: 'Notification marked as read',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Notification' },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Notification not found' },
      },
    },
  },

  '/api/notifications/read-all': {
    put: {
      tags: ['Notifications'],
      summary: 'Mark All Notifications as Read',
      description: 'Mark all notifications for the user as read',
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'All notifications marked as read',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'All marked as read' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
