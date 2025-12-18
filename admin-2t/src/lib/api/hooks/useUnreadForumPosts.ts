import { useEffect, useState, useCallback } from 'react';
import { useForumPosts } from './useForums';

const STORAGE_KEY = 'forum_read_posts';
const STORAGE_EVENT = 'forum_posts_read_updated';

/**
 * Hook para trackear posts de foro no leídos
 * Usa localStorage para persistir qué posts ya vio el atleta
 */
export function useUnreadForumPosts() {
  const { data: posts = [], isLoading } = useForumPosts(false); // Solo publicados
  const [unreadCount, setUnreadCount] = useState(0);

  // Función para calcular posts no leídos
  const calculateUnreadCount = useCallback(() => {
    if (!posts.length) {
      setUnreadCount(0);
      return;
    }

    const readPostsStr = localStorage.getItem(STORAGE_KEY);
    const readPostIds: string[] = readPostsStr ? JSON.parse(readPostsStr) : [];
    const unread = posts.filter(post => !readPostIds.includes(post.id));
    setUnreadCount(unread.length);
  }, [posts]);

  useEffect(() => {
    calculateUnreadCount();
  }, [calculateUnreadCount]);

  // Escuchar cambios en localStorage desde otros componentes
  useEffect(() => {
    const handleStorageChange = () => {
      calculateUnreadCount();
    };

    window.addEventListener(STORAGE_EVENT, handleStorageChange);
    
    return () => {
      window.removeEventListener(STORAGE_EVENT, handleStorageChange);
    };
  }, [calculateUnreadCount]);

  // Función para marcar un post como leído
  const markAsRead = (postId: string) => {
    const readPostsStr = localStorage.getItem(STORAGE_KEY);
    const readPostIds: string[] = readPostsStr ? JSON.parse(readPostsStr) : [];

    if (!readPostIds.includes(postId)) {
      readPostIds.push(postId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readPostIds));
      
      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new Event(STORAGE_EVENT));
      
      // Actualizar el contador local
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Función para marcar todos como leídos
  const markAllAsRead = () => {
    const allPostIds = posts.map(post => post.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPostIds));
    setUnreadCount(0);
  };

  // Función para verificar si un post específico está leído
  const isPostRead = (postId: string): boolean => {
    const readPostsStr = localStorage.getItem(STORAGE_KEY);
    const readPostIds: string[] = readPostsStr ? JSON.parse(readPostsStr) : [];
    return readPostIds.includes(postId);
  };

  return {
    unreadCount,
    markAsRead,
    markAllAsRead,
    isPostRead,
    isLoading
  };
}
