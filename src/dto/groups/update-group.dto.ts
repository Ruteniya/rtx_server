import { Pto } from 'rtxtypes'
import { IsString, IsInt, Min, MaxLength, IsOptional, IsArray } from 'class-validator'

export class UpdateGroupDto implements Pto.Groups.UpdateGroup {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name: string

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Number of participants must be greater than 0' })
  numberOfParticipants: number

  @IsString()
  @IsOptional()
  categoryId: string

  @IsArray()
  @IsString({ each: true })
  emails: string[]
}
