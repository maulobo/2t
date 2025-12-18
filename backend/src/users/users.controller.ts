import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('coaches')
  findAllCoaches() {
    return this.usersService.findAllCoaches();
  }

  @Post('coach')
  createCoach(
    @Body()
    createCoachDto: {
      email: string;
      password: string;
      phone?: string;
    },
  ) {
    return this.usersService.createCoach(createCoachDto);
  }
}
