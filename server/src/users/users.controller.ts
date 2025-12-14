import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async list() {
    const users = await this.usersService.findAll();
    return users.map((u) => this.usersService.sanitize(u));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async getById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    return this.usersService.sanitize(user);
  }
}