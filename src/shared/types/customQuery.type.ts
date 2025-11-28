import { PaginationParams } from './pagination.type';

export class CustomQuery {
  take?: number;
  skip?: number;
  where: Record<string, unknown> = {};
  orderBy?: Record<string, 'asc' | 'desc'>;

  static fromPagination<T>(params: PaginationParams<T>): CustomQuery {
    const query = new CustomQuery();

    if (params.limit !== undefined) query.limit(params.limit);
    if (params.offset !== undefined) query.offset(params.offset);

    if (params.orderBy) {
      query.order({ [params.orderBy]: params.order });
    }

    if (params.searchBy && params.searchFor) {
      query.filter({
        [params.searchBy as string]: new RegExp(params.searchFor, 'i'),
      });
    }

    return query;
  }

  offset(skip?: number): this {
    this.skip = skip;
    return this;
  }

  limit(take?: number): this {
    this.take = take;
    return this;
  }

  filter(conditions: Record<string, unknown>): this {
    this.where = { ...this.where, ...conditions };
    return this;
  }

  withCondition(condition: Record<string, unknown>): this {
    if (Object.keys(this.where).length === 0) {
      this.where = condition;
    } else {
      this.where = {
        AND: [this.where, condition],
      };
    }
    return this;
  }

  order(orderBy: Record<string, 'asc' | 'desc'>): this {
    this.orderBy = orderBy;
    return this;
  }
}
