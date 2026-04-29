export default function Spinner({ fullscreen = false, size = 24 }) {
  const spinner = (
    <svg
      className="animate-spin text-[#3ea76e]"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeLinecap="round" />
    </svg>
  )
  if (fullscreen)
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  return spinner
}
