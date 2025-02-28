import { IsString, IsOptional, IsHexColor, MaxLength } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @MaxLength(255)
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsHexColor()
  color?: string // Ensures the color is a valid hex code
}
