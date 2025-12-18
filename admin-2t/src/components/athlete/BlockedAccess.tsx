import Link from "next/link";

interface BlockedAccessProps {
  title?: string;
  message?: string;
}

export default function BlockedAccess({ 
  title = "Acceso Restringido",
  message = "Necesitas un pago activo para acceder a esta sección."
}: BlockedAccessProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-8 text-center shadow-2xl dark:border-red-600 dark:bg-red-900/30">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50">
          <svg className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="mb-4 text-2xl font-bold text-red-900 dark:text-red-200">
          {title}
        </h2>
        
        <p className="mb-6 text-red-800 dark:text-red-300">
          {message}
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/athlete/payments"
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Ver Mis Pagos
          </Link>
          <Link
            href="/athlete/dashboard"
            className="rounded-lg border-2 border-red-600 bg-white px-6 py-3 font-semibold text-red-600 transition-all hover:bg-red-50 dark:border-red-500 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
