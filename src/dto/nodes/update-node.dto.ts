import { Pto } from '@rtx/types'
import { IsString, IsOptional, MaxLength, IsInt, Min, IsEnum } from 'class-validator'

export class UpdateNodeDto implements Pto.Nodes.UpdateNode {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  @IsEnum(Pto.Nodes.AnswerType)
  answerType?: Pto.Nodes.AnswerType

  @IsString()
  @IsOptional()
  question?: string

  @IsOptional()
  @IsString()
  questionImage?: string

  @IsOptional()
  @IsString()
  adminDescription?: string

  @IsOptional()
  @IsString()
  correctAnswer?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number

  @IsOptional()
  @IsString()
  comment?: string
}
