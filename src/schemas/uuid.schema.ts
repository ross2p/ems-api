import * as Joi from 'joi';

export const uuidSchema = Joi.string().uuid().messages({
  'string.guid': 'Value must be a valid UUID',
});
