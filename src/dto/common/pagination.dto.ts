import { Pto } from 'rtxtypes'
import { Transform, Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class PaginationDto implements Pto.App.Pagination {
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
}
