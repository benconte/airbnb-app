import { Transition } from '@headlessui/react'
import numeral from 'numeral'
import { Fragment } from 'react'
import { useStore } from '../../../store/useStore'

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
      enter="saved-panel-enter"
      enterFrom="saved-panel-enter-from"
      enterTo="saved-panel-enter-to"
      leave="saved-panel-leave"
      leaveFrom="saved-panel-leave-from"
      leaveTo="saved-panel-leave-to"
    >
      <aside className="saved-panel">
        <h3 className="saved-panel__title">Saved Listings</h3>
        {savedListings.length === 0 ? (
          <p className="saved-panel__empty">No saved listings yet.</p>
        ) : (
          <ul className="saved-panel__list">
            {savedListings.map((listing) => (
              <li key={listing.id} className="saved-panel__item">
                <p className="saved-panel__item-title">{listing.title}</p>
                <p className="saved-panel__item-location">{listing.location}</p>
                <p className="saved-panel__item-price">{numeral(listing.pricePerNight).format('$0')}</p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </Transition>
  )
}
