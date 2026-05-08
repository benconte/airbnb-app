interface Props {
  rating: number
  reviews: number
}

const MOCK_BREAKDOWN = [
  { stars: 5, value: 4.5, color: '#ff4a26' },
  { stars: 5, value: 3.5, color: '#2ea44f' },
  { stars: 3, value: 1.5, color: '#f0a500' },
  { stars: 3, value: 5.2, color: '#0075ff' },
  { stars: 1, value: 6.9, color: '#e03535' },
]

const MOCK_REVIEWS = [
  {
    name: 'Ethan Blackwood',
    date: '25 Oct 2023 at 12:27 pm',
    rating: 3.5,
    text: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which.',
    helpful: 16,
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&h=120&fit=crop',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&h=120&fit=crop',
    ],
    avatar: 'https://i.pravatar.cc/48?img=11',
  },
  {
    name: 'Gabriel North',
    date: '25 Oct 2023 at 12:27 pm',
    rating: 4.0,
    text: 'This is some content from a media component. You can replace this with any content and adjust it as needed.',
    helpful: 4,
    images: [],
    avatar: 'https://i.pravatar.cc/48?img=22',
  },
]

function StarRating({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(value) ? '#f0a500' : '#ddd'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

export function RatingBreakdown({ rating, reviews }: Props) {
  const maxBar = Math.max(...MOCK_BREAKDOWN.map((b) => b.value))

  return (
    <div className="flex flex-col gap-6">
      {/* Rating summary card */}
      <div className="flex gap-10 border border-gray-200 rounded-2xl px-8 py-6">
        {/* Average score */}
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <div className="relative flex items-center justify-center">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#ff4a26" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="absolute text-sm font-bold text-[#ff4a26]">{rating}</span>
          </div>
          <p className="text-xs text-gray-400 text-center leading-tight">
            {reviews.toLocaleString()} Ratings &amp; 293 Reviews
          </p>
        </div>

        {/* Bars */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Rating breakdown</h4>
          <div className="flex flex-col gap-2.5">
            {MOCK_BREAKDOWN.map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <StarRating value={row.stars} />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(row.value / maxBar) * 100}%`, background: row.color }}
                  />
                </div>
                <span className="text-[11px] font-bold text-white bg-gray-800 rounded-full px-2 py-0.5 min-w-[32px] text-center">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review cards */}
      <div className="flex flex-col gap-4">
        {MOCK_REVIEWS.map((r, i) => (
          <div key={i} className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <img src={r.avatar} alt={r.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">- {r.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.date}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <StarRating value={r.rating} />
                <span className="text-xs font-semibold text-gray-600">{r.rating}/5</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">{r.text}</p>

            <button className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors w-fit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              Helpful Review
              <span className="font-bold text-gray-900 border-l border-gray-300 pl-2 ml-1">{r.helpful}</span>
            </button>

            {r.images.length > 0 && (
              <div className="flex gap-2.5 flex-wrap">
                {r.images.map((img, j) => (
                  <img key={j} src={img} alt="review" className="w-24 h-20 object-cover rounded-xl" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
