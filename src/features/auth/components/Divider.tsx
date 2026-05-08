export function Divider() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-sm font-semibold text-gray-500">
        Or
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}
