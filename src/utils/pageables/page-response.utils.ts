import { PageRequest } from './page-request.utils';

export class PageResponse<T, R = T> {
  private readonly totalCount: number;
  private readonly pageNumber: number;
  private readonly pageSize: number;
  private readonly pageCount?: number;
  private readonly content: T[];

  constructor(pageRequest: PageRequest<R>, content: T[], totalCount: number) {
    this.pageNumber = pageRequest.pageNumber;
    this.pageSize =
      content.length < pageRequest.pageSize
        ? content.length
        : pageRequest.pageSize;
    this.pageCount = Math.ceil(
      totalCount / (this.pageSize === 0 ? pageRequest.pageSize : this.pageSize),
    );
    this.content = content;
    this.totalCount = totalCount;
  }

  public map<U>(
    callbackFn: (value: T, index: number, array: T[]) => U,
    thisArg?: any,
  ): PageResponse<U> {
    return new PageResponse<U>(
      {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
      } as PageRequest<U>,
      this.content.map(callbackFn, thisArg),
      this.totalCount,
    );
  }
}
