import type { InputHTMLAttributes } from "react"

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  // optional error message from validation
  error?: string
}

export function AuthInput({
  label,
  error,
  ...inputProps
}: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#ff4a26] transition-colors"
        {...inputProps}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
