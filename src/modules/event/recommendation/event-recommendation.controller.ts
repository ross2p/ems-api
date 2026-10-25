import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import {
  ApiAuth,
  ApiErrorResponse,
  ApiSuccessResponse,
  ResponseMessage,
  UserDetails,
} from '../../../decorators';
import { AuthGuard } from '../../../guards/user.guard';
import { UserEntity } from '../../user/user.entity';
import { ValidationPipe } from '../../../pipes/validation.pipe';
import { uuidSchema } from '../../../schemas/uuid.schema';
import { EventWithScoreDto } from './dto/event-with-score.dto';
import { EventRecommendationService } from './event-recommendation.service';
import { CacheService } from '../../cache/cache.service';

const requiredEventIdSchema = uuidSchema
  .required()
  .messages({ 'any.required': 'Event ID is required' });

@ApiTags('Events')
@ApiAuth()
@Controller('event')
export class EventRecommendationController {
  constructor(
    private readonly eventRecommendationService: EventRecommendationService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('recommendation')
  @ApiOperation({
    summary: 'Get recommended events',
    description:
      'Events similar to the given one, personalized for the current user. Sorted by score, best first.',
  })
  @ApiQuery({
    name: 'eventId',
    description: 'Identifier of the event to find similar ones for',
    format: 'uuid',
  })
  @ApiSuccessResponse({
    type: EventWithScoreDto,
    isArray: true,
    description: 'Similar events retrieved successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Event ID is missing or invalid or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found or access token user not found',
  })
  @ResponseMessage('Similar events retrieved successfully')
  @UseGuards(AuthGuard)
  async getRecommendations(
    @Query('eventId', new ValidationPipe(requiredEventIdSchema))
    eventId: string,
    @UserDetails() user: UserEntity,
  ) {
    const userId = user.id;
    const cacheKey = `similar_events:${eventId}:${userId}`;

    return this.cacheService.getOrSet(cacheKey, () =>
      this.eventRecommendationService.getRecommendedEvents(eventId, userId),
    );
  }
}
