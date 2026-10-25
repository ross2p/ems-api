import { ApiProperty, PickType } from '@nestjs/swagger';
import { EventEntity } from '../event.entity';
import { CategoryEntity } from '../../category/category.entity';
import { UserEntity } from '../../user/user.entity';

export class EventCreatorDto extends PickType(UserEntity, [
  'id',
  'firstName',
  'lastName',
  'email',
] as const) {}

/** Event in a list: with its category and creator */
export class EventListItemDto extends EventEntity {
  @ApiProperty({
    description: 'Event category',
    type: CategoryEntity,
    nullable: true,
  })
  category: CategoryEntity | null;

  @ApiProperty({ description: 'User who created the event', type: UserEntity })
  createdBy: UserEntity;
}

/** Single event: with its category and a short creator profile */
export class EventDetailsDto extends EventEntity {
  @ApiProperty({
    description: 'Event category',
    type: CategoryEntity,
    nullable: true,
  })
  category: CategoryEntity | null;

  @ApiProperty({
    description: 'User who created the event',
    type: EventCreatorDto,
  })
  createdBy: EventCreatorDto;
}
