"use client";

import { useRouter } from "next/navigation";
import {
  useForumPosts,
  useDeleteForumPost,
  useToggleForumPostPublished,
} from "@/lib/api/hooks/useForums";
import type { ForumPost } from "@/types/athlete";

export default function ForosAdminPage() {
  const router = useRouter();
  const { data: posts = [], isLoading } = useForumPosts(true); // Ver todos (publicados + borradores)
  const deleteMutation = useDeleteForumPost();
  const toggleMutation = useToggleForumPostPublished();

  const handleEdit = (postId: string) => {
    router.push(`/foros/${postId}/editar`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleTogglePublished = async (id: string) => {
    await toggleMutation.mutateAsync(id);
  };

  const publishedPosts = posts.filter(p => p.published);
  const draftPosts = posts.filter(p => !p.published);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Foros
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Crea y gestiona anuncios para todos los atletas
          </p>
        </div>
        <button
          onClick={() => router.push('/foros/nuevo')}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo Anuncio
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-white p-12 text-center shadow dark:bg-gray-800">
          <p className="text-gray-500">Cargando posts...</p>
        </div>
      ) : (
        <>
          {/* Posts Publicados */}
          <div className="rounded-xl bg-white shadow dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Publicados ({publishedPosts.length})
              </h2>
            </div>
            {publishedPosts.length === 0 ? (
              <div className="p-6 text-center text-gray-600 dark:text-gray-400">
                No hay posts publicados
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {publishedPosts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublished={handleTogglePublished}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Borradores */}
          {draftPosts.length > 0 && (
            <div className="rounded-xl bg-white shadow dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Borradores ({draftPosts.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {draftPosts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublished={handleTogglePublished}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// COMPONENTES
// ============================================

function PostItem({
  post,
  onEdit,
  onDelete,
  onTogglePublished,
}: {
  post: ForumPost;
  onEdit: (postId: string) => void;
  onDelete: (id: string) => void;
  onTogglePublished: (id: string) => void;
}) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {post.title}
            </h3>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                post.published
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {post.published ? "Publicado" : "Borrador"}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {post.content}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            {new Date(post.createdAt).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="ml-4 flex gap-2">
          <button
            onClick={() => onTogglePublished(post.id)}
            className={`rounded-lg p-2 ${
              post.published
                ? "text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
            }`}
            title={post.published ? "Despublicar" : "Publicar"}
          >
            {post.published ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onEdit(post.id)}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            title="Editar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            title="Eliminar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
