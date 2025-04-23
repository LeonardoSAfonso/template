import { CustomQuery, EntityKeyOrder } from './customQuery.type';

export default class PaginationParams<T> {
  constructor(
    readonly offset?: number,
    readonly limit?: number,
    readonly ordenation: string = 'asc',
    readonly orderBy?: keyof T,
    readonly searchBy?: string,
    readonly searchFor?: string,
  ) {
    this.offset = offset;
    this.limit = limit;
    this.ordenation = ordenation;
    this.orderBy = orderBy;
    this.searchBy = searchBy;
    this.searchFor = searchFor;
  }

  getQuery(): CustomQuery<T> {
    const query = new CustomQuery<T>()
      .orderedBy({
        ...(this.orderBy && { [this.orderBy]: this.ordenation }),
      } as EntityKeyOrder<T>)
      .withLimit(this.limit)
      .withOffset(this.offset)
      .withCondition({
        ...(this.searchFor &&
          this.searchBy && {
            [this.searchBy]: new RegExp(`${this.searchFor}`, 'i'),
          }),
      })
      .build();

    return query;
  }

  getCount() {
    const query = new CustomQuery<T>()
      .withCondition({
        ...(this.searchFor &&
          this.searchBy && {
            [this.searchBy]: new RegExp(`${this.searchFor}`, 'i'),
          }),
      })
      .build();

    return query;
  }
}
