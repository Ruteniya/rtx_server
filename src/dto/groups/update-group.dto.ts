import { Pto } from 'rtxtypes'
import { IsNotEmpty, IsString, IsInt, Min, MaxLength, IsOptional } from 'class-validator'

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
}
