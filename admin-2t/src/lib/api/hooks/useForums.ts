import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllForumPosts,
  getForumPostById,
  getRecentForumPosts,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  toggleForumPostPublished,
} from '@/lib/api/forums';
import type { ForumPost, CreateForumPostDto, UpdateForumPostDto } from '@/types/athlete';

// ============================================
// QUERY HOOKS - LEER
// ============================================

/**
 * Hook para obtener todos los posts del foro
 */
export const useForumPosts = (includeUnpublished = false) => {
  return useQuery<ForumPost[], Error>({
    queryKey: ['forum-posts', includeUnpublished],
    queryFn: () => getAllForumPosts(includeUnpublished),
  });
};

/**
 * Hook para obtener un post específico
 */
export const useForumPost = (id: string) => {
  return useQuery<ForumPost, Error>({
    queryKey: ['forum-posts', id],
    queryFn: () => getForumPostById(id),
    enabled: !!id,
  });
};

/**
 * Hook para obtener posts recientes
 */
export const useRecentForumPosts = (limit = 5) => {
  return useQuery<ForumPost[], Error>({
    queryKey: ['forum-posts', 'recent', limit],
    queryFn: () => getRecentForumPosts(limit),
  });
};

// ============================================
// MUTATION HOOKS - ESCRIBIR (ADMIN)
// ============================================

/**
 * Hook para crear un post
 */
export const useCreateForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation<ForumPost, Error, CreateForumPostDto>({
    mutationFn: createForumPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
  });
};

/**
 * Hook para actualizar un post
 */
export const useUpdateForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation<ForumPost, Error, { id: string; data: UpdateForumPostDto }>({
    mutationFn: ({ id, data }) => updateForumPost(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts', data.id] });
    },
  });
};

/**
 * Hook para eliminar un post
 */
export const useDeleteForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteForumPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
  });
};

/**
 * Hook para cambiar estado de publicación
 */
export const useToggleForumPostPublished = () => {
  const queryClient = useQueryClient();

  return useMutation<ForumPost, Error, string>({
    mutationFn: toggleForumPostPublished,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts', data.id] });
    },
  });
};
