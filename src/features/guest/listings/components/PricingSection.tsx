import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import type { ListingPricing, PricingBadge } from '../types'
import { Badge } from '../../../../shared/ui/badge'
import { Skeleton } from '../../../../shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../shared/ui/tooltip'

interface Props {
  listingId: string
  /** Base nightly rate — shown as default standard room */
  basePricePerNight: number
}

const BADGE_CONFIG: Record<
  PricingBadge,
  {
    label: string
    variant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
  }
> = {
  NEW: { label: 'New', variant: 'default' },
  RECOMMENDED: { label: 'Recommended', variant: 'warning' },
  POPULAR: { label: 'Popular', variant: 'success' },
  BEST_VALUE: { label: 'Best Value', variant: 'secondary' },
}

function PriceRow({ item }: { item: ListingPricing }) {
  const badgeCfg = item.badge ? BADGE_CONFIG[item.badge] : null

  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0 gap-4 group">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {item.name}
          </p>

          {badgeCfg && (
            <Badge
              variant={badgeCfg.variant}
              className="text-[10px] h-4 px-1.5"
            >
              {badgeCfg.label}
            </Badge>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-gray-500 leading-relaxed">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <p className="text-xs text-gray-400">
            {item.tags.join(' · ')}
          </p>
        )}
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-baseline gap-0.5 shrink-0 cursor-default">
              <span className="text-base font-extrabold text-gray-900">
                ${item.price.toFixed(2)}
              </span>
              <span className="text-[11px] text-gray-400">/night</span>
            </div>
          </TooltipTrigger>

          <TooltipContent side="left" className="text-xs">
            Select this option in the booking form above
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function PricingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-center py-4 border-b border-gray-100"
        >
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>

          <Skeleton className="h-5 w-14" />
        </div>
      ))}
    </div>
  )
}

export function PricingSection({
  listingId,
  basePricePerNight,
}: Props) {
  const { data: pricings, isLoading } = useQuery<ListingPricing[]>({
    queryKey: ['listing-pricings', listingId],
    queryFn: () =>
      api.get(`/api/v1/listings/${listingId}/pricings`),
    staleTime: 5 * 60 * 1000,
  })

  const pricingItems: ListingPricing[] = [
    {
      id: 'default-standard-room',
      name: 'Standard Room',
      description: 'Base nightly rate',
      price: basePricePerNight,
      tags: [],
      badge: undefined,
      sortOrder: -1,
      isActive: true,
      listingId,
      createdAt: '',
      updatedAt: '',
    },
    ...(pricings ?? []),
  ]

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-2xl font-extrabold text-gray-900">
          Pricing
        </h2>

        {!isLoading && (
          <span className="text-xs text-gray-400">
            From{' '}
            <strong className="text-gray-700">
              $
              {Math.min(
                ...pricingItems.map((p) => p.price)
              ).toFixed(2)}
            </strong>{' '}
            / night
          </span>
        )}
      </div>

      {isLoading ? (
        <PricingSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
          {pricingItems.map((item) => (
            <PriceRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
