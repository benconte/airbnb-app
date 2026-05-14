import { useState } from 'react'

interface Props {
  images: string[];
  title: string
}

export function PhotoGallery({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  console.log(images)

  const defaultImages = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://lobby-benconte.vercel.app/_next/image?url=https%3A%2F%2Fs3-media0.fl.yelpcdn.com%2Fbphoto%2FSTkuNT61iRgrlCExHkyKXg%2Fo.jpg&w=640&q=75',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=260&fit=crop'
  ]

  const photos = [
    images[0] || defaultImages[0],
    images[1] || defaultImages[1],
    images[2] || defaultImages[2],
    ...images.slice(3)
  ]

  const main = photos[0]
  const side = photos.slice(1, 3)

  return (
    <>
      <div className="grid grid-cols-[2fr_1fr] gap-2 rounded-2xl overflow-hidden h-[420px]">
        <div className="overflow-hidden cursor-pointer" onClick={() => setLightboxIndex(0)}>
          <img
            src={main}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        </div>
        <div className="grid grid-rows-2 gap-2 min-h-0">
          {side.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden cursor-pointer"
              onClick={() => setLightboxIndex(i + 1)}
            >
              <img
                src={img}
                alt={`${title} ${i + 2}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
              />
              {i === side.length - 1 && (
                <button
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i + 1) }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                  View photos
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center gap-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-5 right-6 bg-white/15 text-white text-xl w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/25 transition-colors border-0"
            onClick={() => setLightboxIndex(null)}
          >
            ✕
          </button>
          <img
            src={photos[lightboxIndex]}
            alt={title}
            className="max-w-[90vw] max-h-[82vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex gap-2">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full border-0 cursor-pointer transition-colors ${i === lightboxIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
