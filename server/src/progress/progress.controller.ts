import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { StartProgressDto } from './dto/start-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CompleteProgressDto } from './dto/complete-progress.dto';
import { ChapterProgress } from './chapter-progress.entity';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get('me')
  async me(@Req() req: any) {
    const userId: number = req.user.id;
    return this.progress.getAllForUser(userId);
  }

  @Get('topic/:topicDocumentId')
  async getTopic(@Req() req: any, @Param('topicDocumentId') topicDocumentId: string) {
    const userId: number = req.user.id;
    return this.progress.getForUserAndTopic(userId, topicDocumentId);
  }

  @Post('start')
  async start(@Req() req: any, @Body() dto: StartProgressDto) {
    const userId: number = req.user.id;
    return this.progress.start(userId, dto);
  }

  @Patch('topic/:topicDocumentId')
  async update(
    @Req() req: any,
    @Param('topicDocumentId') topicDocumentId: string,
    @Body() patch: UpdateProgressDto,
  ) {
    const userId: number = req.user.id;
    return this.progress.update(userId, topicDocumentId, patch);
  }

  @Post('complete')
  async complete(@Req() req: any, @Body() dto: CompleteProgressDto) {
    const userId: number = req.user.id;
    return this.progress.complete(userId, dto.topicDocumentId);
  }

  @Get('chapter/:chapterDocumentId')
  async chapter(@Req() req: any, @Param('chapterDocumentId') chapterDocumentId: string): Promise<ChapterProgress> {
    const userId: number = req.user.id;
    return this.progress.recomputeChapter(userId, chapterDocumentId);
  }

  @Get('chapters')
  async chapters(@Req() req: any) {
    const userId: number = req.user.id;
    // Return all chapter aggregates for this user by scanning distinct chapterDocumentId values
    // We use recompute to ensure fresh values
    const topicRows = await this.progress.getAllForUser(userId);
    const chapterIds = Array.from(new Set(topicRows.map((r: any) => r.chapterDocumentId).filter(Boolean)));
    const results = await Promise.all(chapterIds.map((cid) => this.progress.recomputeChapter(userId, cid as string)));
    return results;
  }
}
