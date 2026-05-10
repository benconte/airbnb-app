import { Transition } from '@headlessui/react'
import numeral from 'numeral'
import { Fragment } from 'react'
import { useStore } from '../../../../store/useStore'

type SavedListingsProps = {
  open: boolean
}

export function SavedListings({ open }: SavedListingsProps) {
  const {
    state: { listings, saved },
  } = useStore()

  const savedListings = listings.filter((listing) => saved.includes(listing.id))

  return (
    <Transition
      as={Fragment}
      show={open}
      enter="transition-all duration-200"
      enterFrom="translate-x-5 opacity-0"
      enterTo="translate-x-0 opacity-100"
      leave="transition-all duration-180"
      leaveFrom="translate-x-0 opacity-100"
      leaveTo="translate-x-5 opacity-0"
    >
      <aside className="fixed right-4 top-[110px] w-80 max-h-[70vh] overflow-auto rounded-[14px] border border-gray-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.2)] p-3.5 z-30">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Saved Listings</h3>
        {savedListings.length === 0 ? (
          <p className="text-sm text-gray-400">No saved listings yet.</p>
        ) : (
          <ul className="list-none m-0 p-0 flex flex-col gap-2">
            {savedListings.map((listing) => (
              <li key={listing.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900 m-0">{listing.title}</p>
                <p className="text-xs text-gray-500 m-0">{listing.location}</p>
                <p className="text-xs font-bold text-[#ff4a26] m-0">
                  {numeral(listing.pricePerNight).format('$0')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </Transition>
  )
}
