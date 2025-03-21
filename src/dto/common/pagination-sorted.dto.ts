import { Pto } from 'rtxtypes'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class PaginationSortedDto implements Pto.App.Pagination, Pto.App.Sorting {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number

  @IsOptional()
  @IsString()
  sortBy?: string

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC'
}
