import { ApiProperty } from '@nestjs/swagger';
import { PageResponse } from './page-response.utils';
export class PageRequest<T = any> {
  @ApiProperty({
    description: 'The page number to retrieve',
    example: 1,
    required: false,
  })
  pageNumber: number = 1;

  @ApiProperty({
    description: 'The number of items per page',
    example: 200,
    required: false,
  })
  pageSize: number = 200;

  get skip(): number {
    return this.pageNumber * this.pageSize - this.pageSize;
  }

  toPageResponse<U>(content: U[], count: number): PageResponse<U, T> {
    return new PageResponse<U, T>(this, content, count);
  }

  getFilter() {
    return {
      skip: this.skip,
      take: this.pageSize,
    };
  }
}
