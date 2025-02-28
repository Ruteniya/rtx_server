import { Pto } from '@rtx/types'
import { IsNotEmpty, IsString, IsInt, Min, MaxLength } from 'class-validator'

export class CreateGroupDto implements Pto.Groups.CreateGroup {
  @IsString()
  @MaxLength(255)
  name: string

  @IsInt()
  @Min(1, { message: 'Number of participants must be greater than 0' })
  numberOfParticipants: number

  @IsString()
  @IsNotEmpty()
  categoryId: string
}
