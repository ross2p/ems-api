import { ApiProperty } from '@nestjs/swagger';
import { PageResponse } from './page-response.utils';
export class PageRequest {
  @ApiProperty({
    description: 'Page number, starting from 1',
    type: Number,
    minimum: 1,
    default: 1,
    required: false,
  })
  pageNumber: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    type: Number,
    minimum: 1,
    maximum: 500,
    default: 200,
    required: false,
  })
  pageSize: number = 200;

  get skip(): number {
    return this.pageNumber * this.pageSize - this.pageSize;
  }

  get take(): number {
    return this.pageSize;
  }

  toPageResponse<T>(content: T[], count: number): PageResponse<T> {
    return new PageResponse<T>(this, content, count);
  }

  getFilter() {
    return {
      skip: this.skip,
      take: this.pageSize,
    };
  }
}
