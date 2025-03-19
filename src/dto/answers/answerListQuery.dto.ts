import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsUUID, IsArray, ArrayNotEmpty, IsDate, IsString } from 'class-validator'
import { Pto } from '@rtx/types'
import { PaginationDto } from '../common'

export class AnswerListQuery extends PaginationDto implements Pto.Answers.AnswerListQuery {
  @IsOptional()
  @IsString()
  searchText?: string

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return value
    console.log('value: correct', value)
    if (typeof value === 'string')
      return value.toLowerCase() === 'true' // Враховуємо можливі варіанти в регістрі
    else return value
  })
  @IsBoolean()
  processed?: boolean

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return value
    console.log('value: correct', value)
    if (typeof value === 'string')
      return value.toLowerCase() === 'true' // Враховуємо можливі варіанти в регістрі
    else return value
  })
  @IsBoolean()
  correct?: boolean

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',')))
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  groupIds?: string[]

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date
}
