// File: src/swagger/schemas/adminAdminSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminAdminSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  AdminLoginRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', example: 'admin@example.com' },
      password: { type: 'string', format: 'password', example: 'admin123' },
    },
    required: ['email', 'password'],
  },

  AdminLoginResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Login successful' },
      token: { type: 'string', example: 'eyJhbGci…' },
      user: { $ref: '#/components/schemas/Admin' },
    },
    required: ['message', 'token', 'user'],
  },

  RefreshTokenResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string', example: 'eyJhbGci…' },
    },
    required: ['accessToken'],
  },

  LogoutResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Logout successful' },
    },
    required: ['message'],
  },

  CreateAdminRequest: {
    type: 'object',
    required: ['email', 'password', 'firstName', 'lastName', 'role'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phone: { type: 'string' },
      profileImage: { type: 'string', format: 'binary' },
      address: { $ref: '#/components/schemas/Address' },
      role: {
        type: 'string',
        enum: [
          'super_admin',
          'sales_regional_director',
          'sales_country_manager',
          'sales_account_manager',
          'admissions_manager',
          'application_processing',
          'compliance',
          'finance',
        ],
        description: 'Role of the admin',
      },
    },
  },

  UpdateAdminRequest: {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phone: { type: 'string' },
      profileImage: { type: 'string', format: 'binary' },
      address: { $ref: '#/components/schemas/Address' },
      password: { type: 'string', minLength: 8 },
      role: {
        type: 'string',
        enum: [
          'super_admin',
          'sales_regional_director',
          'sales_country_manager',
          'sales_account_manager',
          'admissions_manager',
          'application_processing',
          'compliance',
          'finance',
        ],
        description: 'Role of the admin',
      },
    },
  },

  Admin: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phone: { type: 'string' },
      profileImage: { type: 'string', format: 'uri' },
      address: { $ref: '#/components/schemas/Address' },
      isActive: { type: 'boolean' },
      isEmailVerified: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      role: {
        type: 'string',
        enum: [
          'super_admin',
          'sales_regional_director',
          'sales_country_manager',
          'sales_account_manager',
          'admissions_manager',
          'application_processing',
          'compliance',
          'finance',
        ],
        description: 'Role of the admin',
      },
    },
  },

  AdminListResponse: {
    type: 'object',
    properties: {
      admins: {
        type: 'array',
        items: { $ref: '#/components/schemas/Admin' }
      },
      totalPages: {
        type: 'integer',
        description: 'Total number of pages available'
      },
      currentPage: {
        type: 'integer',
        description: 'Current page number'
      }
    },
    required: ['admins', 'totalPages', 'currentPage']
  },
};
