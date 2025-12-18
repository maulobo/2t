import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============ COACHES ============

  @Get('coaches')
  async getAllCoaches() {
    return this.adminService.getAllCoaches();
  }

  @Post('coaches')
  async createCoach(
    @Body()
    data: {
      email: string;
      password: string;
      phone?: string;
    },
  ) {
    return this.adminService.createCoach(data);
  }

  @Delete('coaches/:id')
  async deleteCoach(@Param('id') id: string) {
    return this.adminService.deleteCoach(id);
  }

  // ============ ATHLETES ============

  @Get('athletes')
  async getAllAthletes() {
    return this.adminService.getAllAthletes();
  }

  @Get('athletes/:id')
  async getAthleteById(@Param('id') id: string) {
    return this.adminService.getAthleteById(id);
  }

  @Delete('athletes/:id')
  async deleteAthlete(@Param('id') id: string) {
    return this.adminService.deleteAthlete(id);
  }

  // ============ USERS ============

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }
}
