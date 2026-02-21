import { PageRequest } from './page-request.utils';

export class PageResponse<T> {
  public readonly totalCount: number;
  public readonly pageNumber: number;
  public readonly pageSize: number;
  public readonly pageCount?: number;
  public readonly content: T[];

  constructor(pageRequest: PageRequest, content: T[], totalCount: number) {
    this.pageNumber = pageRequest.pageNumber;
    this.pageSize = Math.min(content.length, pageRequest.pageSize);
    this.pageCount = Math.ceil(
      totalCount / (this.pageSize === 0 ? pageRequest.pageSize : this.pageSize),
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
