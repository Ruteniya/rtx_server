import { Pto } from '@rtx/types'
import { IsOptional, IsString } from 'class-validator'

export class SortingDto implements Pto.App.Sorting {
  @IsOptional()
  @IsString()
  sortBy?: number

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC'
}
