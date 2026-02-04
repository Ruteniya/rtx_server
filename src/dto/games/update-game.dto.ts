import { Pto } from 'rtxtypes'
import { IsString, MaxLength, IsOptional, IsDateString, IsBoolean, IsEnum } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateGameDto implements Pto.Games.UpdateGame {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(Pto.Games.GameStatus)
  status: Pto.Games.GameStatus

  @IsOptional()
  @IsDateString()
  startDate: Date

  @IsOptional()
  @IsDateString()
  endDate: Date
}

export class UpdateGameOptionsDto implements Pto.Games.UpdateGameOptions {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  deleteLogo?: boolean
}
