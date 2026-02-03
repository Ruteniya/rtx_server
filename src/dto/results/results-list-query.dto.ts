import { Transform } from 'class-transformer'
import { IsArray, IsIn, IsOptional, IsUUID, ArrayNotEmpty } from 'class-validator'
import { Pto } from 'rtxtypes'
import { PaginationDto } from '../common'

const allowedSortFields = ['groupName', 'totalPoints'] as const
const allowedSortDirections = ['ASC', 'DESC'] as const

export class ResultsListQueryDto extends PaginationDto implements Pto.Results.ResultsListQuery {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',')))
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  categoryIds?: string[]

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
  @IsIn(allowedSortFields)
  sortBy?: (typeof allowedSortFields)[number]

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsIn(allowedSortDirections)
  sortOrder?: (typeof allowedSortDirections)[number]
}
