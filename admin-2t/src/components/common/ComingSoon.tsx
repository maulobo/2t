import React from 'react';
import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  description?: string;
  backLink?: string;
  backText?: string;
}

export default function ComingSoon({ 
  title, 
  description = "Estamos trabajando duro para traerte esta funcionalidad muy pronto.",
  backLink = "/athlete/dashboard",
  backText = "Volver al Dashboard"
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 rounded-full bg-brand-50 p-6 dark:bg-brand-900/20">
        <svg 
          className="h-16 w-16 text-brand-500 dark:text-brand-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
          />
        </svg>
      </div>
      
      <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
        {title}
      </h1>
      
      <p className="mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
        {description}
      </p>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href={backLink}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          {backText}
        </Link>
      </div>
    </div>
  );
}
