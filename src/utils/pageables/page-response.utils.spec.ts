import { PageRequest } from './page-request.utils';
import { PageResponse } from './page-response.utils';

describe('PageResponse', () => {
  let pageRequest: PageRequest;

  beforeEach(() => {
    pageRequest = new PageRequest();
    pageRequest.pageNumber = 1;
    pageRequest.pageSize = 10;
  });

  it('should initialize correctly with content smaller than pageSize', () => {
    const content = ['a', 'b', 'c']; // length 3
    const totalCount = 13;

    const response = new PageResponse(pageRequest, content, totalCount);

    expect(response.totalCount).toBe(13);
    expect(response.pageNumber).toBe(1);
    expect(response.pageSize).toBe(3); // Math.min(3, 10)
    expect(response.pageCount).toBe(2); // Math.ceil(13 / 3)
    expect(response.content).toEqual(content);
  });

  it('should initialize correctly with content exactly equal to pageSize', () => {
    const content = Array.from({ length: 10 }, (_, i) => i);
    const totalCount = 20;

    const response = new PageResponse(pageRequest, content, totalCount);

    expect(response.pageSize).toBe(10); // Math.min(10, 10)
    expect(response.pageCount).toBe(2); // Math.ceil(20 / 10)
  });

  it('should initialize correctly with empty content', () => {
    const content: string[] = [];
    const totalCount = 0;

    const response = new PageResponse(pageRequest, content, totalCount);

    expect(response.totalCount).toBe(0);
    expect(response.pageNumber).toBe(1);
    expect(response.pageSize).toBe(0); // Math.min(0, 10)
    expect(response.pageCount).toBe(0); // Math.ceil(0 / 10) fallback to pageRequest.pageSize
    expect(response.content).toEqual([]);
  });

  it('should map content using map function', () => {
    const content = [1, 2, 3]; // length 3
    const totalCount = 10;

    const response = new PageResponse<number>(pageRequest, content, totalCount);

    const mappedResponse = response.map((item) => item * 2);

    expect(mappedResponse).toBeInstanceOf(PageResponse);
    expect(mappedResponse.content).toEqual([2, 4, 6]);
    expect(mappedResponse.pageNumber).toBe(1);
    expect(mappedResponse.pageSize).toBe(3);
    expect(mappedResponse.totalCount).toBe(10);
    expect(mappedResponse.pageCount).toBe(4); // Math.ceil(10 / 3) = 4
  });
});
