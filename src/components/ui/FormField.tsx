import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100";

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}

export function Label({ htmlFor, children, required }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-gray-700"
    >
      {children}
      {required && <span className="text-brand-600"> *</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div>
      <Label htmlFor={inputId!} required={props.required}>
        {label}
      </Label>
      <input id={inputId} className={`${fieldClassName} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name;

  return (
    <div>
      <Label htmlFor={inputId!} required={props.required}>
        {label}
      </Label>
      <textarea
        id={inputId}
        className={`${fieldClassName} min-h-[100px] resize-y ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  id,
  className = "",
  ...props
}: SelectProps) {
  const inputId = id ?? props.name;

  return (
    <div>
      <Label htmlFor={inputId!} required={props.required}>
        {label}
      </Label>
      <select
        id={inputId}
        className={`${fieldClassName} ${className}`}
        {...props}
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
