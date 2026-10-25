import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiResponseCommonMetadata,
  getSchemaPath,
} from '@nestjs/swagger';
import { GlobalResponse } from '../utils/responses/global-response.utils';
import { PageResponse } from '../utils/pageables/page-response.utils';

/**
 * Same options as ApiResponse, except the ones these decorators build themselves:
 * the response schema comes from `type`, so `content` and `schema` are not accepted.
 */
type ApiResponseBaseOptions = Omit<
  ApiResponseCommonMetadata,
  'type' | 'isArray' | 'content'
>;

export type ApiSuccessResponseOptions = ApiResponseBaseOptions & {
  /** Model of the `data` field */
  type: Type<unknown>;
  /** `data` is an array of `type` */
  isArray?: boolean;
};

export type ApiPageResponseOptions = ApiResponseBaseOptions & {
  /** Model of the items in `data.content` */
  type: Type<unknown>;
};

export type ApiErrorResponseOptions = ApiResponseBaseOptions & {
  status: NonNullable<ApiResponseBaseOptions['status']>;
};

/**
 * Documents a response wrapped by ResponseInterceptor:
 * GlobalResponse with `data` of the given model (or an array of it).
 */
export const ApiSuccessResponse = ({
  type,
  isArray = false,
  status = HttpStatus.OK,
  ...options
}: ApiSuccessResponseOptions) =>
  applyDecorators(
    ApiExtraModels(GlobalResponse, type),
    ApiResponse({
      ...options,
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(GlobalResponse) },
          {
            properties: {
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(type) } }
                : { $ref: getSchemaPath(type) },
            },
          },
        ],
      },
    }),
  );

/**
 * Documents a paginated response wrapped by ResponseInterceptor:
 * GlobalResponse with `data` of PageResponse<type>.
 */
export const ApiPageResponse = ({
  type,
  status = HttpStatus.OK,
  ...options
}: ApiPageResponseOptions) =>
  applyDecorators(
    ApiExtraModels(GlobalResponse, PageResponse, type),
    ApiResponse({
      ...options,
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(GlobalResponse) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(PageResponse) },
                  {
                    properties: {
                      content: {
                        type: 'array',
                        description: 'Items on this page',
                        items: { $ref: getSchemaPath(type) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );

/**
 * Documents an error response produced by the exception filters.
 */
export const ApiErrorResponse = (options: ApiErrorResponseOptions) =>
  applyDecorators(
    ApiExtraModels(GlobalResponse),
    ApiResponse({
      ...options,
      schema: {
        allOf: [
          { $ref: getSchemaPath(GlobalResponse) },
          {
            properties: {
              data: {
                type: 'object',
                nullable: true,
                description: 'Error details, e.g. validation errors',
              },
            },
          },
        ],
      },
    }),
  );

/**
 * Documents an unexpected error caught by the global filters.
 * Endpoint-level 500 responses override this description.
 */
export const ApiServerErrorResponse = () =>
  ApiErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Unexpected server error',
  });

/**
 * Documents endpoints protected by AuthGuard: bearer token and its errors.
 * Endpoint-level 400/404/500 responses override the descriptions set here,
 * so they must mention the token errors too.
 */
export const ApiAuth = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiErrorResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Access token is invalid or expired',
    }),
    ApiErrorResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Access token is missing or has no user',
    }),
    ApiErrorResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Access token user not found',
    }),
    ApiServerErrorResponse(),
  );
