import { Pto } from '@rtx/types'
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID } from 'class-validator'

export class AddAnswerDto implements Pto.Answers.AddAnswer {
  @IsString()
  @IsNotEmpty()
  answerValue: string

  @IsUUID()
  @IsNotEmpty()
  nodeId: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  userComment?: string
}
