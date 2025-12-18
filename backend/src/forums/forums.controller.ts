import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ForumsService } from './forums.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('forums')
@UseGuards(JwtAuthGuard)
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  // ==================== ENDPOINTS ADMIN ====================

  /**
   * Crear un post del foro
   * POST /forums
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  async create(
    @Body()
    body: {
      title: string;
      content: string;
      published?: boolean;
    },
    @Request() req,
  ) {
    return this.forumsService.create({
      title: body.title,
      content: body.content,
      authorId: req.user.id,
      published: body.published,
    });
  }

  /**
   * Actualizar un post
   * PUT /forums/:id
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      content?: string;
      published?: boolean;
    },
  ) {
    return this.forumsService.update(id, body);
  }

  /**
   * Eliminar un post
   * DELETE /forums/:id
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  async remove(@Param('id') id: string) {
    return this.forumsService.remove(id);
  }

  /**
   * Cambiar estado de publicación
   * PATCH /forums/:id/toggle
   */
  @Put(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  async togglePublished(@Param('id') id: string) {
    return this.forumsService.togglePublished(id);
  }

  // ==================== ENDPOINTS PÚBLICOS ====================

  /**
   * Listar todos los posts publicados
   * GET /forums
   * GET /forums?includeUnpublished=true (solo admin)
   */
  @Get()
  async findAll(
    @Query('includeUnpublished') includeUnpublished?: string,
    @Request() req?,
  ) {
    // Solo admin puede ver posts no publicados
    const canSeeUnpublished =
      includeUnpublished === 'true' &&
      (req?.user?.role === 'ADMIN' || req?.user?.role === 'COACH');

    return this.forumsService.findAll(canSeeUnpublished);
  }

  /**
   * Ver un post específico
   * GET /forums/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.forumsService.findOne(id);
  }
}
