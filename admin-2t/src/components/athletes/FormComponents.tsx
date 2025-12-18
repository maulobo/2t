/**
 * Componentes de formulario reutilizables para el perfil del atleta
 */

import React from "react";

interface FormInputProps {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "tel" | "date" | "number" | "email";
  required?: boolean;
  placeholder?: string;
  step?: string;
}

export function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  step,
}: FormInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={step}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  placeholder = "Seleccionar...",
}: FormSelectProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}

export function FormTextarea({
  label,
  name,
  value,
  onChange,
  rows = 3,
  required = false,
  placeholder,
}: FormTextareaProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

interface FormSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <div className="border-t pt-4 dark:border-gray-700">
      <h4 className="mb-3 font-semibold text-gray-800 dark:text-white">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h4>
      {children}
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string | null | undefined;
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-900 dark:text-white">{value || "-"}</p>
    </div>
  );
}

interface InfoFieldTextProps {
  label: string;
  value: string;
}

export function InfoFieldText({ label, value }: InfoFieldTextProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
