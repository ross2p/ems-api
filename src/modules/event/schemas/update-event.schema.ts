import * as Joi from 'joi';

export const updateEventSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional().messages({
    'string.min': 'Event title must have at least 1 character',
    'string.max': 'Event title must not exceed 200 characters',
  }),
  description: Joi.string().min(1).max(1000).optional().messages({
    'string.min': 'Event description must have at least 1 character',
    'string.max': 'Event description must not exceed 1000 characters',
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
  categoryId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Category ID must be a valid UUID',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
