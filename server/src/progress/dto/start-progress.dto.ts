import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class StartProgressDto {
  @IsString()
  topicDocumentId: string;

  @IsOptional()
  @IsString()
  chapterDocumentId?: string;

  @IsInt()
  @Min(0)
  totalBlocks: number;
}
