import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class GenerateSlidesDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  prompt: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  hints?: string;
}
