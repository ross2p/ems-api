import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { ResponseMessage, UserDetails } from '../../../decorators';
import { AuthGuard } from '../../../guards/user.guard';
import { UserEntity } from '../../user/user.entity';
import { ValidationPipe } from '../../../pipes/validation.pipe';
import { uuidSchema } from '../../../schemas/uuid.schema';
import { EventWithScoreDto } from './dto/event-with-score.dto';
import { EventRecommendationService } from './event-recommendation.service';
import { CacheService } from '../../cache/cache.service';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('event')
export class EventRecommendationController {
  constructor(
    private readonly eventRecommendationService: EventRecommendationService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('recommendation')
  @ApiOperation({
    summary: 'Get similar events with personalized recommendations',
    description:
      'Returns personalized event recommendations if user is authenticated. Uses collaborative filtering and content-based filtering.',
  })
  @ApiQuery({ name: 'eventId', description: 'Target Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Similar events retrieved',
    type: [EventWithScoreDto],
  })
  @ResponseMessage('Similar events retrieved successfully')
  @UseGuards(AuthGuard)
  async getRecommendations(
    @Query('eventId') eventId: string,
    @UserDetails() user: UserEntity,
  ) {
    const userId = user.id;
    const cacheKey = `similar_events:${eventId}:${userId}`;

    return this.cacheService.getOrSet(cacheKey, () =>
      this.eventRecommendationService.getRecommendedEvents(eventId, userId),
    );
  }
}
