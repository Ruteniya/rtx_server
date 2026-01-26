import { Pto } from 'rtxtypes'
import { IsString, IsOptional, MaxLength, Min, IsEnum, ValidateIf, IsNumber } from 'class-validator'
import { Transform } from 'class-transformer'

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
  adminDescription?: string

  @ValidateIf((o) => o.answerType === Pto.Nodes.AnswerType.Text)
  @IsString({ message: 'correctAnswer must be a string if answerType is text' })
  correctAnswer?: string

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  points: number

  @IsOptional()
  @IsString()
  comment?: string
}
