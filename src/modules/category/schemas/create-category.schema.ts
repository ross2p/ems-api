import * as Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Category name is required',
    'string.max': 'Category name must not exceed 100 characters',
    'any.required': 'Category name is required',
  }),
  color: Joi.string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Color must be a valid hex color code (e.g., #FF5733)',
      'any.required': 'Color is required',
    }),
  description: Joi.string().min(1).max(500).required().messages({
    'string.min': 'Description is required',
    'string.max': 'Description must not exceed 500 characters',
    'any.required': 'Description is required',
  }),
});
