import { Pto } from 'rtxtypes'
import { IsString, IsOptional, MaxLength, IsInt, Min, IsEnum } from 'class-validator'

export class CreateNodeDto implements Pto.Nodes.CreateNode {
  @IsString()
  @MaxLength(255)
  name: string

  @IsString()
  @IsEnum(Pto.Nodes.AnswerType)
  answerType: Pto.Nodes.AnswerType

  @IsString()
  question: string

  @IsOptional()
  @IsString()
  questionImage?: string

  @IsOptional()
  @IsString()
  adminDescription?: string

  @IsOptional()
  @IsString()
  correctAnswer?: string

  @IsInt()
  @Min(0)
  points: number

  @IsOptional()
  @IsString()
  comment?: string
}
