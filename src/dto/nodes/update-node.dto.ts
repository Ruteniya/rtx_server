import { Pto } from 'rtxtypes'
import { IsString, IsOptional, MaxLength, Min, IsEnum, ValidateIf, IsBoolean, IsNumber } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateNodeDto implements Pto.Nodes.UpdateNode {
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

export class UpdateNodeOptionsDto implements Pto.Nodes.UpdateNodeOptions {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  deleteQuestionImage?: boolean

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  deleteCorrectAnswerImage?: boolean
}
