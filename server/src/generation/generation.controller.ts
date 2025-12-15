import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerationService } from './generation.service';
import { GenerateSlidesDto } from './dto/generate-slides.dto';

@Controller('generation')
@UseGuards(JwtAuthGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('generate-slides')
  async generateSlides(
    @Req() req: any,
    @Body() dto: GenerateSlidesDto
  ) {
    const userId: number = req.user.id;
    return this.generationService.generateSlides(
      userId,
      dto.prompt,
      dto.hints
    );
  }
}
