import { Pto } from '@rtx/types'
import { IsString, MaxLength, IsOptional, IsDateString } from 'class-validator'

export class UpdateGameDto implements Pto.Games.UpdateGame {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsString()
  logo?: string

  @IsOptional()
  @IsDateString()
  startDate: Date

  @IsOptional()
  @IsDateString()
  endDate: Date
}
