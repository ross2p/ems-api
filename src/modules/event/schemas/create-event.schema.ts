import * as Joi from 'joi';

export const createEventSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Event title is required',
    'string.max': 'Event title must not exceed 200 characters',
    'any.required': 'Event title is required',
  }),
  description: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Event description is required',
    'string.max': 'Event description must not exceed 1000 characters',
    'any.required': 'Event description is required',
  }),
  startDate: Joi.date().iso().required().messages({
    'date.base': 'Start date must be a valid date',
    'date.iso': 'Start date must be in ISO format',
    'any.required': 'Start date is required',
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.iso': 'End date must be in ISO format',
    'date.min': 'End date must be greater than or equal to start date',
    'any.required': 'End date is required',
  }),
  categoryId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Category ID must be a valid UUID',
    }),
});
