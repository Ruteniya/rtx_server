import { Pto } from '@rtx/types'
import { IsNotEmpty, IsString, MaxLength, IsEmail, IsOptional } from 'class-validator'

export class CreateUserDto implements Pto.Users.CreateUser {
  @IsString()
  @MaxLength(255)
  firstName: string

  @IsString()
  @MaxLength(255)
  lastName: string

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  groupId?: string
}
