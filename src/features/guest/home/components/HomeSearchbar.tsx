import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export function HomeSearchbar() {
  const [where, setWhere] = useState('')
  const [guests, setGuests] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (where.trim()) params.set('search', where.trim())
    if (guests.trim()) params.set('guests', guests.trim())
    
    // Navigate to listings page with the search parameters
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <div className="flex justify-center mt-2 mb-8 px-4">
      <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 h-[66px] w-full max-w-2xl">
        
        {/* Where */}
        <label className="flex flex-col justify-center flex-1 hover:bg-gray-100 rounded-full px-8 h-full transition cursor-text">
          <span className="text-[12px] font-bold text-gray-800">Where</span>
          <input 
            type="text" 
            placeholder="Search destinations" 
            className="text-sm text-gray-800 placeholder-gray-500 bg-transparent outline-none w-full"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </label>

        <div className="h-8 w-px bg-gray-200" />

        {/* Who (Guests) - Replacing "When" since backend doesn't support dates for search */}
        <div className="flex flex-row items-center justify-between flex-1 hover:bg-gray-100 rounded-full pl-8 pr-2 h-full transition">
          <label className="flex flex-col justify-center cursor-text w-full">
            <span className="text-[12px] font-bold text-gray-800">Who</span>
            <input 
              type="number" 
              placeholder="Add guests" 
              min="1"
              className="text-sm text-gray-800 placeholder-gray-500 bg-transparent outline-none w-full"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </label>
          
          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="bg-[#ff385c] hover:bg-[#d90b43] text-white rounded-full p-3.5 transition-colors duration-200 shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

      </div>
    </div>
  )
}
