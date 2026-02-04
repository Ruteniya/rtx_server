import { IsArray, IsNumber, IsString, ArrayMinSize, ArrayMaxSize, IsEmail, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Pto } from 'rtxtypes'

export class CsvGroup implements Pto.Groups.CsvGroup {
  @IsString()
  name: string

  @IsString()
  categoryName: string

  @IsNumber()
  numberOfParticipants: number

  @IsArray()
  @ArrayMaxSize(3)
  @IsEmail({}, { each: true })
  emails: string[]
}

export class CreateGroupFromCsvDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CsvGroup)
  groups: CsvGroup[]
}
