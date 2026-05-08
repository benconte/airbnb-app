import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  text: string
  dark?: boolean
}

export function SocialButton({
  icon,
  text,
  dark,
}: Props) {
  return (
    <button
      className={`
        w-full h-12 rounded-xl flex items-center justify-center gap-3 cursor-pointer
        font-medium transition-all
        ${dark
          ? 'bg-[#1d1f27] text-white hover:opacity-90'
          : 'bg-[#efebeb] text-[#1f1f1f] hover:bg-[#e7e3e3]'
        }
      `}
    >
      {icon}
      {text}
    </button>
  )
}
