"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateForumPost } from "@/lib/api/hooks/useForums";

export default function NuevoForoPage() {
  const router = useRouter();
  const createMutation = useCreateForumPost();
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("⚠️ Por favor completa todos los campos");
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      router.push("/foros");
    } catch (error) {
      console.error("Error al crear post:", error);
      alert("❌ Error al crear el anuncio. Intenta nuevamente.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver a Foros
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Crear Nuevo Anuncio
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comparte información importante con todos los atletas
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card del formulario */}
        <div className="rounded-xl bg-white shadow-lg dark:bg-gray-800 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Título */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Título del Anuncio *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Horarios Especiales por Fiestas"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                required
              />
            </div>

            {/* Contenido */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Contenido *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Escribe aquí el contenido del anuncio..."
                rows={12}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 resize-y"
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Tip: Usa saltos de línea para organizar mejor el contenido
              </p>
            </div>

            {/* Estado de publicación */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <label
                    htmlFor="published"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Publicar inmediatamente
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Si no está marcado, el anuncio se guardará como borrador y
                    solo tú podrás verlo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>

              <div className="flex items-center gap-3">
                {formData.published ? (
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Se publicará para todos los atletas
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Se guardará como borrador
                  </span>
                )}

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {formData.published ? "Crear y Publicar" : "Guardar Borrador"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview opcional */}
        {(formData.title || formData.content) && (
          <div className="rounded-xl bg-white shadow-lg dark:bg-gray-800 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vista Previa
              </h3>
            </div>
            <div className="p-6">
              {formData.title && (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {formData.title}
                </h2>
              )}
              {formData.content && (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {formData.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
