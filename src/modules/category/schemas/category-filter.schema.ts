import * as Joi from 'joi';
import { pageRequestSchema } from '../../../schemas/page-request.schema';

export const categoryFilterSchema = pageRequestSchema.keys({
  search: Joi.string().min(1).max(255).optional().messages({
    'string.base': 'Search term must be a string',
    'string.min': 'Search term cannot be empty',
    'string.max': 'Search term cannot exceed 255 characters',
  }),
});
