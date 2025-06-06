import { Pto } from 'rtxtypes'
import { IsNotEmpty, IsString, MaxLength, IsEmail, IsOptional } from 'class-validator'

export class ChangeUserRole implements Pto.Users.ChangeUserRole {
  @IsString()
  @IsNotEmpty()
  role: Pto.Users.UserRoleType
}
