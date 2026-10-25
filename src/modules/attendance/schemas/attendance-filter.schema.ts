import * as Joi from 'joi';
import { pageRequestSchema } from '../../../schemas/page-request.schema';

export const attendanceFilterSchema = pageRequestSchema.keys({
  eventId: Joi.string().uuid({ version: 'uuidv4' }).optional().messages({
    'string.guid': 'Event ID must be a valid UUID',
  }),
});
