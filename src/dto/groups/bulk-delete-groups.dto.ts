import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator'

export class BulkDeleteGroupsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  groupIds: string[]
}
