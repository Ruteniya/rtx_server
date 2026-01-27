import { Pto } from 'rtxtypes'
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID, ValidateIf } from 'class-validator'

export class AddAnswerDto implements Omit<Pto.Answers.AddAnswer, 'answerValue'> {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  answerValue?: string

  @IsUUID()
  @IsNotEmpty()
  nodeId: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  userComment?: string
}
