import * as Joi from 'joi';

export const pageRequestSchema = Joi.object({
  pageNumber: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Page number must be a number',
    'number.integer': 'Page number must be an integer',
    'number.min': 'Page number must be at least 1',
  }),

  pageSize: Joi.number().integer().min(1).max(500).optional().messages({
    'number.base': 'Page size must be a number',
    'number.integer': 'Page size must be an integer',
    'number.min': 'Page size must be at least 1',
    'number.max': 'Page size cannot exceed 500',
  }),
});
