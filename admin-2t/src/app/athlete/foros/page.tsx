"use client";

import { useRouter } from "next/navigation";
import { useForumPosts } from "@/lib/api/hooks/useForums";
import { useUnreadForumPosts } from "@/lib/api/hooks/useUnreadForumPosts";

export default function ForosAthletePage() {
  const router = useRouter();
  const { data: posts = [], isLoading } = useForumPosts(false); // Solo publicados
  const { isPostRead } = useUnreadForumPosts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Anuncios y Novedades
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Mantente al día con las últimas novedades del box
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-white p-12 text-center shadow dark:bg-gray-800">
          <p className="text-gray-500">Cargando anuncios...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow dark:bg-gray-800">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            No hay anuncios disponibles por el momento
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => {
            const isUnread = !isPostRead(post.id);
            
            return (
              <div
                key={post.id}
                className={`cursor-pointer rounded-xl bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-800 relative ${
                  isUnread ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() => router.push(`/athlete/foros/${post.id}`)}
              >
                {isUnread && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    •
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-gray-600 dark:text-gray-400">
                      {post.content}
                    </p>
                  </div>
                  <svg
                    className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(post.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {post.updatedAt !== post.createdAt && (
                  <span className="text-xs italic">
                    Actualizado el{" "}
                    {new Date(post.updatedAt).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
