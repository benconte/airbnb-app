import type { ChangeEvent } from "react"

interface Props {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function AuthInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange
}: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#ff4a26] transition-colors"
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
