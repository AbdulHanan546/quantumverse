import { Controller, Post, Get, Body, Req, UseGuards, Param } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressDetails } from './user-progress.entity';

@Controller('user-progress')
@UseGuards(JwtAuthGuard)
export class UserProgressController {
  constructor(private readonly progressService: UserProgressService) {}

  @Post('update')
  async updateProgress(
    @Req() req: any,
    @Body() body: { topicId: string; stats: ProgressDetails },
  ) {
    const userId = req.user.id;
    return this.progressService.updateProgress(userId, body.topicId, body.stats);
  }

  @Get('me')
  async getMyProgress(@Req() req: any) {
    const userId = req.user.id;
    return this.progressService.getAllForUser(userId);
  }

  @Get('leaderboard/global')
  async getLeaderboard() {
    return this.progressService.getLeaderboard(50); // Return top 50
  }

  // --- NEW ENDPOINT ---
  @Get('profile-stats')
  async getProfileStats(@Req() req: any) {
    const userId = req.user.id;
    return this.progressService.getUserProfileStats(userId);
  }
  
  @Get(':topicId')
  async getTopicProgress(@Req() req: any, @Param('topicId') topicId: string) {
    const userId = req.user.id;
    return this.progressService.getByTopic(userId, topicId);
  }

  @Post('batch')
  async getBatchTopicProgress(
    @Req() req: any, 
    @Body() body: { topicIds: string[] }
  ) {
    const userId = req.user.id;
    return this.progressService.getBatchProgress(userId, body.topicIds);
  }
}