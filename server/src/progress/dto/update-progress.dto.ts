import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  lastIndex: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalBlocks?: number;
}
