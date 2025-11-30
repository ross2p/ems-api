import * as Joi from 'joi';

export const updateAttendanceSchema = Joi.object({
  userId: Joi.string().uuid({ version: 'uuidv4' }).optional().messages({
    'string.guid': 'User ID must be a valid UUID',
  }),
  eventId: Joi.string().uuid({ version: 'uuidv4' }).optional().messages({
    'string.guid': 'Event ID must be a valid UUID',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
