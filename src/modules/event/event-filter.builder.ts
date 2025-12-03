import { Prisma } from 'generated/prisma';

export class EventFilterBuilder {
  private whereClause: Prisma.EventWhereInput = {};
  private orderByClause: Prisma.EventOrderByWithRelationInput = {
    createdAt: 'desc',
  };

  addRadiusFilter(
    latitude?: number,
    longitude?: number,
    radiusKm?: number,
  ): this {
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      radiusKm !== undefined
    ) {
      const earthRadiusKm = 6371;
      const latDiff = (radiusKm / earthRadiusKm) * (180 / Math.PI);
      const lonDiff =
        (radiusKm / (earthRadiusKm * Math.cos((Math.PI * latitude) / 180))) *
        (180 / Math.PI);

      this.whereClause.AND = this.whereClause.AND || [];
      (this.whereClause.AND as Prisma.EventWhereInput[]).push({
        AND: [
          {
            latitude: {
              gte: latitude - latDiff,
              lte: latitude + latDiff,
            },
          },
          {
            longitude: {
              gte: longitude - lonDiff,
              lte: longitude + lonDiff,
            },
          },
        ],
      });
    }
    return this;
  }

  addSearch(search?: string): this {
    if (search) {
      this.whereClause.OR = [
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
      ];
    }
    return this;
  }

  addCategoryFilter(categoryId?: string | null): this {
    if (categoryId !== undefined) {
      this.whereClause.categoryId = categoryId;
    }
    return this;
  }

  addDateRangeFilter(startDate?: Date | string, endDate?: Date | string): this {
    if (startDate || endDate) {
      this.whereClause.AND = this.whereClause.AND || [];

      if (startDate) {
        (this.whereClause.AND as Prisma.EventWhereInput[]).push({
          startDate: {
            gte: startDate instanceof Date ? startDate : new Date(startDate),
          },
        });
      }

      if (endDate) {
        (this.whereClause.AND as Prisma.EventWhereInput[]).push({
          endDate: {
            lte: endDate instanceof Date ? endDate : new Date(endDate),
          },
        });
      }
    }
    return this;
  }

  addSorting(
    sortBy?: 'date' | 'title' | 'createdAt',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): this {
    if (sortBy) {
      switch (sortBy) {
        case 'date':
          this.orderByClause = { startDate: sortOrder };
          break;
        case 'title':
          this.orderByClause = { title: sortOrder };
          break;
        case 'createdAt':
          this.orderByClause = { createdAt: sortOrder };
          break;
      }
    }
    return this;
  }

  addExcludeEventIds(excludeEventIds?: string[]): this {
    if (excludeEventIds && excludeEventIds.length > 0) {
      this.whereClause.AND = this.whereClause.AND || [];
      (this.whereClause.AND as Prisma.EventWhereInput[]).push({
        id: {
          notIn: excludeEventIds,
        },
      });
    }
    return this;
  }

  buildWhereClause(): Prisma.EventWhereInput {
    return this.whereClause;
  }

  buildOrderByClause(): Prisma.EventOrderByWithRelationInput {
    return this.orderByClause;
  }

  build(): {
    where: Prisma.EventWhereInput;
    orderBy: Prisma.EventOrderByWithRelationInput;
  } {
    return {
      where: this.whereClause,
      orderBy: this.orderByClause,
    };
  }
}
