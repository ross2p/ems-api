import * as Joi from 'joi';
import { pageRequestSchema } from '../../../schemas/page-request.schema';

export const eventQuerySchema = pageRequestSchema.keys({
  search: Joi.string().min(1).max(255).optional().messages({
    'string.base': 'Search term must be a string',
    'string.min': 'Search term cannot be empty',
    'string.max': 'Search term cannot exceed 255 characters',
  }),

  categoryId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .optional()
    .allow(null, '')
    .messages({
      'string.guid': 'Category ID must be a valid UUID',
    }),

  startDate: Joi.date().iso().optional().messages({
    'date.base': 'Start date must be a valid date',
    'date.iso': 'Start date must be in ISO format',
  }),

  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    'date.base': 'End date must be a valid date',
    'date.iso': 'End date must be in ISO format',
    'date.min': 'End date must be greater than or equal to start date',
  }),

  sortBy: Joi.string().valid('date', 'title', 'createdAt').optional().messages({
    'any.only': 'Sort by must be either "date", "title", or "createdAt"',
  }),

  sortOrder: Joi.string().valid('asc', 'desc').optional().messages({
    'any.only': 'Sort order must be either "asc" or "desc"',
  }),
});
