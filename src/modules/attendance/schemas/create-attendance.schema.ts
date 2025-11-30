import * as Joi from 'joi';

export const createAttendanceSchema = Joi.object({
  userId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required',
  }),
  eventId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'Event ID must be a valid UUID',
    'any.required': 'Event ID is required',
  }),
});
