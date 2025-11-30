import * as Joi from 'joi';

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});
