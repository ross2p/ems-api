import { ApiProperty } from '@nestjs/swagger';
import { PageRequest } from './page-request.utils';

export class PageResponse<T> {
  @ApiProperty({ description: 'Total number of items', type: Number })
  public readonly totalCount: number;

  @ApiProperty({ description: 'Current page number', type: Number })
  public readonly pageNumber: number;

  @ApiProperty({ description: 'Number of items on this page', type: Number })
  public readonly pageSize: number;

  @ApiProperty({ description: 'Total number of pages', type: Number })
  public readonly pageCount?: number;

  // Documented per endpoint by ApiPageResponse
  public readonly content: T[];

  constructor(pageRequest: PageRequest, content: T[], totalCount: number) {
    this.pageNumber = pageRequest.pageNumber;
    this.pageSize = Math.min(content.length, pageRequest.pageSize);
    this.pageCount = Math.ceil(
      totalCount / Math.max(content.length, pageRequest.pageSize),
    );
    this.content = content;
    this.totalCount = totalCount;
  }

  public map<U>(
    callbackFn: (value: T, index: number, array: T[]) => U,
  ): PageResponse<U> {
    return new PageResponse<U>(
      {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
      } as PageRequest,
      this.content.map((element, index, array) =>
        callbackFn(element, index, array),
      ),
      this.totalCount,
    );
  }
}
