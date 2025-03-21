import { Pto } from 'rtxtypes'
import { IsString, IsDateString, IsOptional, MaxLength, IsUUID } from 'class-validator'

export class CreateGameDto implements Pto.Games.CreateGame {
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

  @IsDateString()
  startDate: Date

  @IsDateString()
  endDate: Date
}
