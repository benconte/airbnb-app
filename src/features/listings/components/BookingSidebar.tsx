import { useState } from 'react'

interface Props {
  price: number
  available: boolean
  availableFrom: string
}

export function BookingSidebar({ price, available, availableFrom }: Props) {
  const [form, setForm] = useState({ name: '', email: '', comment: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit() {
    if (!form.name || !form.email) return
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setForm({ name: '', email: '', comment: '' })
  }

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-[#ff4a26] transition-colors placeholder:text-gray-400'

  return (
    <aside className="flex flex-col gap-5">
      {/* Booking card */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[17px] font-bold text-gray-900">
            Book a room{' '}
            <span className="text-[#ff4a26] font-[caveat] text-xl font-extrabold">online</span>
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-gray-900">${price}</span>
            <span className="text-xs text-gray-400">/night</span>
          </div>
        </div>

        {!available && (
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-medium px-6 py-2.5 border-b border-orange-100">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Available from{' '}
            {new Date(availableFrom).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        )}

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">
              Full Name <span className="text-[#ff4a26]">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">
              Email Address <span className="text-[#ff4a26]">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">
              Comment <span className="text-[#ff4a26]">*</span>
            </label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="Any special requests or questions?"
              className={inputClass}
              rows={5}
            />
          </div>
        </div>

        <div className="px-6 pb-2">
          <button
            onClick={handleSubmit}
            disabled={submitted}
            className={`w-full py-3.5 rounded-xl text-white text-[15px] font-bold transition-colors ${submitted ? 'bg-green-600 cursor-default' : 'bg-[#ff4a26] hover:bg-[#e03a18]'
              }`}
          >
            {submitted ? '✓ Request Sent!' : 'Book Now'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 pb-4 pt-2">Powered by Booking.com</p>
      </div>

      {/* Opening hours card */}
      <div className="border border-gray-200 rounded-2xl px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-bold text-gray-900">
            Opening <span className="text-[#ff4a26] font-[caveat] text-xl font-extrabold">Hours</span>
          </h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="flex flex-col gap-2.5">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{day}</span>
              <span className="text-sm text-gray-500">8:00 am – 6:00 pm</span>
            </div>
          ))}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Sunday</span>
            <span className="text-sm font-semibold text-[#ff4a26]">Close</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
