import { Pto } from '@rtx/types'
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator'

export class EvaluateAnswerDto implements Pto.Answers.EvaluateAnswer {
  @IsUUID()
  @IsNotEmpty()
  answerId: string

  @IsBoolean()
  @IsNotEmpty()
  correct: boolean
}
