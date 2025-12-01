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
  location: Joi.string().min(1).max(500).required().messages({
    'string.min': 'Event location is required',
    'string.max': 'Event location must not exceed 500 characters',
    'any.required': 'Event location is required',
  }),
  latitude: Joi.number().min(-90).max(90).optional().allow(null).messages({
    'number.base': 'Latitude must be a valid number',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
  }),
  longitude: Joi.number().min(-180).max(180).optional().allow(null).messages({
    'number.base': 'Longitude must be a valid number',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
  }),
  categoryId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Category ID must be a valid UUID',
    }),

  createdById: Joi.string().uuid().optional(),
  
});
