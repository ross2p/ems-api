import { EventFilterBuilder } from './event-filter.builder';

describe('EventFilterBuilder', () => {
  let builder: EventFilterBuilder;

  beforeEach(() => {
    builder = new EventFilterBuilder();
  });

  it('should be defined', () => {
    expect(builder).toBeDefined();
  });

  describe('addSearch', () => {
    it('should add search filter for title or description', () => {
      const search = 'test';
      const result = builder.addSearch(search).buildWhereClause();

      expect(result.OR).toEqual([
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]);
    });

    it('should not add search filter if search string is empty', () => {
      const result = builder.addSearch('').buildWhereClause();
      expect(result.OR).toBeUndefined();
    });
  });

  describe('addCategoryFilter', () => {
    it('should add category filter', () => {
      const categoryId = 'cat-id';
      const result = builder.addCategoryFilter(categoryId).buildWhereClause();

      expect(result.categoryId).toBe(categoryId);
    });

    it('should not add category filter if undefined', () => {
      const result = builder.addCategoryFilter(undefined).buildWhereClause();
      expect(result.categoryId).toBeUndefined();
    });
  });

  describe('addDateRangeFilter', () => {
    it('should add start date filter', () => {
      const startDate = new Date('2024-01-01');
      const result = builder.addDateRangeFilter(startDate).buildWhereClause();

      expect((result.AND as any)[0].startDate.gte).toEqual(startDate);
    });

    it('should add end date filter', () => {
      const endDate = new Date('2024-01-31');
      const result = builder
        .addDateRangeFilter(undefined, endDate)
        .buildWhereClause();

      expect((result.AND as any)[0].endDate.lte).toEqual(endDate);
    });

    it('should add both start and end date filters', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const result = builder
        .addDateRangeFilter(startDate, endDate)
        .buildWhereClause();

      expect(result.AND).toHaveLength(2);
    });
  });

  describe('addSorting', () => {
    it('should add sorting', () => {
      const result = builder.addSorting('title', 'asc').buildOrderByClause();
      expect(result).toHaveProperty('title', 'asc');
    });

    it('should default to createdAt desc if not specified', () => {
      const result = builder.buildOrderByClause();
      expect(result).toEqual({ createdAt: 'desc' });
    });
  });

  describe('addExcludeEventIds', () => {
    it('should exclude event ids', () => {
      const ids = ['id1', 'id2'];
      const result = builder.addExcludeEventIds(ids).buildWhereClause();

      expect((result.AND as any)[0].id.notIn).toEqual(ids);
    });

    it('should not add exclusion if array is empty', () => {
      const result = builder.addExcludeEventIds([]).buildWhereClause();
      expect(result.AND).toBeUndefined();
    });
  });
});
