import * as Joi from 'joi';

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Category name must have at least 1 character',
    'string.max': 'Category name must not exceed 100 characters',
  }),
  description: Joi.string().min(1).max(500).optional().messages({
    'string.min': 'Description must have at least 1 character',
    'string.max': 'Description must not exceed 500 characters',
  }),

  createdById: Joi.string().uuid().optional(),
});
