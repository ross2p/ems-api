import { PageRequest } from './page-request.utils';
import { PageResponse } from './page-response.utils';

describe('PageRequest', () => {
  it('should initialize with default values', () => {
    const pageRequest = new PageRequest();
    expect(pageRequest.pageNumber).toBe(1);
    expect(pageRequest.pageSize).toBe(200);
  });

  it('should calculate skip correctly', () => {
    const pageRequest = new PageRequest();
    pageRequest.pageNumber = 2;
    pageRequest.pageSize = 10;
    expect(pageRequest.skip).toBe(10);

    pageRequest.pageNumber = 3;
    expect(pageRequest.skip).toBe(20);
  });

  it('should return correct take value', () => {
    const pageRequest = new PageRequest();
    pageRequest.pageSize = 15;
    expect(pageRequest.take).toBe(15);
  });

  it('should return correct filter object', () => {
    const pageRequest = new PageRequest();
    pageRequest.pageNumber = 2;
    pageRequest.pageSize = 50;

    expect(pageRequest.getFilter()).toEqual({
      skip: 50,
      take: 50,
    });
  });

  it('should create a PageResponse from toPageResponse', () => {
    const pageRequest = new PageRequest();
    pageRequest.pageNumber = 1;
    pageRequest.pageSize = 10;

    const content = ['item1', 'item2'];
    const count = 20;

    const response = pageRequest.toPageResponse(content, count);

    expect(response).toBeInstanceOf(PageResponse);
    expect(response.content).toEqual(content);
    expect(response.totalCount).toBe(20);
    expect(response.pageNumber).toBe(1);
    expect(response.pageSize).toBe(2);
  });
});
