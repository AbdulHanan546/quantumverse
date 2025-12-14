import { IsString } from 'class-validator';

export class CompleteProgressDto {
  @IsString()
  topicDocumentId: string;
}
