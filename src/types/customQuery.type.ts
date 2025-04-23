export type EntityKeyOrder<T> = { [K in keyof T]: 'asc' | 'desc' };

export class CustomQuery<T> {
  take?: number;

  skip?: number;

  where: Record<string, unknown> = {};

  orderBy?: EntityKeyOrder<T>;

  withOffset(offset?: number) {
    this.skip = offset;
    return this;
  }

  withLimit(limit?: number) {
    this.take = limit;
    return this;
  }

  withCondition(conditional: Record<string, unknown>) {
    this.where = Object.assign(this.where, conditional);
    return this;
  }

  orderedBy(order?: EntityKeyOrder<T>) {
    this.orderBy = order;

    return this;
  }

  build() {
    const query = new CustomQuery<T>();

    query.take = this.take;
    query.skip = this.skip;
    query.where = this.where;
    query.orderBy = this.orderBy;

    return query;
  }
}
