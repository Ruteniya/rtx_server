import { IsArray, IsNumber, IsString, ArrayMinSize, ArrayMaxSize, IsEmail, ValidateNested } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { Pto } from 'rtxtypes'

export class CsvGroup implements Pto.Groups.CsvGroup {
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string

  @IsString()
  @Transform(({ value }) => value.trim())
  categoryName: string

  @IsNumber()
  @Transform(({ value }) => Number(value))
  numberOfParticipants: number

  @IsArray()
  @ArrayMaxSize(3)
  @IsEmail({}, { each: true })
  @Transform(({ value }) => value.map((email: string) => email.trim()))
  emails: string[]
}

export class CreateGroupFromCsvDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CsvGroup)
  groups: CsvGroup[]
}
