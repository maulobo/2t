import axios from 'axios';
import type { ForumPost, CreateForumPostDto, UpdateForumPostDto } from '@/types/athlete';

/**
 * SDK para gestión de Posts del Foro
 * Endpoints: /forums/*
 */

// ============================================
// ADMIN - CREAR, EDITAR, ELIMINAR
// ============================================

/**
 * Crear un nuevo post del foro (Admin/Coach)
 */
export const createForumPost = async (data: CreateForumPostDto): Promise<ForumPost> => {
  const response = await axios.post('/api/forums', data);
  return response.data;
};

/**
 * Actualizar un post del foro (Admin/Coach)
 */
export const updateForumPost = async (
  id: string,
  data: UpdateForumPostDto
): Promise<ForumPost> => {
  const response = await axios.put(`/api/forums/${id}`, data);
  return response.data;
};

/**
 * Eliminar un post del foro (Admin/Coach)
 */
export const deleteForumPost = async (id: string): Promise<void> => {
  await axios.delete(`/api/forums/${id}`);
};

/**
 * Cambiar estado de publicación (Admin/Coach)
 */
export const toggleForumPostPublished = async (id: string): Promise<ForumPost> => {
  const response = await axios.put(`/api/forums/${id}/toggle`);
  return response.data;
};

// ============================================
// PÚBLICO - LEER
// ============================================

/**
 * Obtener todos los posts publicados
 * Admin puede ver posts no publicados con includeUnpublished=true
 */
export const getAllForumPosts = async (includeUnpublished = false): Promise<ForumPost[]> => {
  const params = includeUnpublished ? { includeUnpublished: 'true' } : {};
  const response = await axios.get('/api/forums', { params });
  return response.data;
};

/**
 * Obtener un post específico por ID
 */
export const getForumPostById = async (id: string): Promise<ForumPost> => {
  const response = await axios.get(`/api/forums/${id}`);
  return response.data;
};

/**
 * Obtener posts recientes (últimos N posts publicados)
 */
export const getRecentForumPosts = async (limit = 5): Promise<ForumPost[]> => {
  const posts = await getAllForumPosts(false);
  return posts.slice(0, limit);
};

/**
 * Verificar si hay posts nuevos desde una fecha
 */
export const hasNewForumPosts = async (since: string): Promise<boolean> => {
  const posts = await getAllForumPosts(false);
  const sinceDate = new Date(since);
  return posts.some(post => new Date(post.createdAt) > sinceDate);
};
