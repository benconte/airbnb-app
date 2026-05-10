import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../auth/hooks/useAuth'
import { api } from '../../../../lib/api'
import { ListingCard } from '../../listings/components/ListingCard'
import { useFavorites } from '../../listings/hooks/useFavorites'
import { motion } from 'framer-motion'

export function WishlistPage() {
  const { user } = useAuth()
  const { toggle, isSaved } = useFavorites()

  const { data: wishlists = [], isLoading } = useQuery({
    queryKey: ['wishlists-full', user?.id],
    queryFn: async () => {
      if (!user) return []
      const res = await api.get(`/api/v1/users/${user.id}/wishlists`)
      return res.data || res?.data?.data || []
    },
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4a26]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Your <span className="text-[#ff4a26] font-[caveat] text-4xl">Wishlists</span>
        </h1>
        <p className="text-gray-500 mt-2">Places you've saved for future adventures.</p>
      </div>

      {wishlists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200"
        >
          <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-[#ff4a26]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">No saves yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">
            As you search, tap the heart icon to save your favorite places and Experiences to a wishlist.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlists.map((listing: any) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              saved={isSaved(listing.id)}
              onToggleSave={() => toggle(listing.id, listing.title)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
