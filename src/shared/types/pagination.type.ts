import { IsOptional, IsIn, IsInt, Min, IsString } from 'class-validator';

export class PaginationParams<T> {
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  orderBy?: keyof T;

  @IsOptional()
  @IsString()
  searchBy?: keyof T;

  @IsOptional()
  @IsString()
  searchFor?: string;

  constructor(params: Partial<PaginationParams<T>>) {
    Object.assign(this, { order: 'asc', ...params });
  }
}
