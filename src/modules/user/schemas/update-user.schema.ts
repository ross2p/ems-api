import * as Joi from 'joi';

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Email must be a valid email address',
  }),
  firstName: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'First name must have at least 1 character',
    'string.max': 'First name must not exceed 100 characters',
  }),
  lastName: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Last name must have at least 1 character',
    'string.max': 'Last name must not exceed 100 characters',
  }),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters long',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
