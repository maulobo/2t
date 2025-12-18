import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ForumsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un post del foro (solo ADMIN)
   */
  async create(data: {
    title: string;
    content: string;
    authorId: string;
    published?: boolean;
  }) {
    return this.prisma.forum.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        published: data.published ?? true,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Listar todos los posts publicados (público)
   */
  async findAll(includeUnpublished: boolean = false) {
    return this.prisma.forum.findMany({
      where: includeUnpublished ? undefined : { published: true },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtener un post por ID (público si está publicado)
   */
  async findOne(id: string) {
    const post = await this.prisma.forum.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return post;
  }

  /**
   * Actualizar un post (solo ADMIN)
   */
  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      published?: boolean;
    },
  ) {
    const post = await this.prisma.forum.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return this.prisma.forum.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        published: data.published,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Eliminar un post (solo ADMIN)
   */
  async remove(id: string) {
    const post = await this.prisma.forum.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    await this.prisma.forum.delete({ where: { id } });
    return { message: 'Post eliminado', id };
  }

  /**
   * Cambiar estado de publicación (solo ADMIN)
   */
  async togglePublished(id: string) {
    const post = await this.prisma.forum.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return this.prisma.forum.update({
      where: { id },
      data: { published: !post.published },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
