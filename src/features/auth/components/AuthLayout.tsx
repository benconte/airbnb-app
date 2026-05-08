import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  subtitle: string
  image: string
  children: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  image,
  children,
}: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f8f7f7]">
      <div className="flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center px-12 text-center bg-[#f8f4f3]">
        <h1 className="text-4xl font-bold leading-tight max-w-xl text-[#1f1f1f]">
          {title}
        </h1>

        <p className="mt-6 text-gray-700 text-sm max-w-lg leading-5">
          {subtitle}
        </p>

        <img
          src={image}
          alt="Auth illustration"
          className="mt-12 max-w-2xl w-full object-contain"
        />
      </div>
    </div>
  )
}
