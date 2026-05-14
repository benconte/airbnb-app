import { useState } from 'react'
import { toast } from 'sonner'
import {
  useListingPricings,
  useCreateListingPricing,
  useUpdateListingPricing,
  useDeleteListingPricing,
  type CreatePricingData,
} from '../hooks/useHostData'
import type { ListingPricing } from '../../guest/listings/types'
import { Button } from '../../../shared/ui/button'
import { Input } from '../../../shared/ui/input'
import { Textarea } from '../../../shared/ui/textarea'
import { Label } from '../../../shared/ui/label'
import { Badge } from '../../../shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select'
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineTag,
} from 'react-icons/hi2'

const BADGE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'NEW', label: '🆕 New' },
  { value: 'RECOMMENDED', label: '⭐ Recommended' },
  { value: 'POPULAR', label: '🔥 Popular' },
  { value: 'BEST_VALUE', label: '💎 Best Value' },
]

const BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  NEW: 'default',
  RECOMMENDED: 'warning',
  POPULAR: 'success',
  BEST_VALUE: 'secondary',
}

interface FormData {
  name: string
  description: string
  tagsRaw: string  // comma-separated
  price: string
  badge: string
  sortOrder: string
}

const defaultForm: FormData = {
  name: '',
  description: '',
  tagsRaw: '',
  price: '',
  badge: '',
  sortOrder: '0',
}

function tierToForm(t: ListingPricing): FormData {
  return {
    name: t.name,
    description: t.description ?? '',
    tagsRaw: t.tags.join(', '),
    price: String(t.price),
    badge: t.badge ?? '',
    sortOrder: String(t.sortOrder),
  }
}

function formToPayload(f: FormData): CreatePricingData {
  return {
    name: f.name.trim(),
    description: f.description.trim() || undefined,
    tags: f.tagsRaw.split(',').map((s) => s.trim()).filter(Boolean),
    price: parseFloat(f.price),
    badge: f.badge || undefined,
    sortOrder: parseInt(f.sortOrder, 10) || 0,
  }
}

interface PricingFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  listingId: string
  editing?: ListingPricing | null
}

function PricingFormDialog({ open, onOpenChange, listingId, editing }: PricingFormDialogProps) {
  const [form, setForm] = useState<FormData>(editing ? tierToForm(editing) : defaultForm)
  const createMutation = useCreateListingPricing(listingId)
  const updateMutation = useUpdateListingPricing(listingId)

  const isPending = createMutation.isPending || updateMutation.isPending
  const isEditing = !!editing

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = () => {
    const payload = formToPayload(form)
    if (!payload.name || isNaN(payload.price) || payload.price <= 0) {
      toast.error('Name and a valid price are required')
      return
    }

    if (isEditing) {
      updateMutation.mutate(
        { pricingId: editing.id, data: payload },
        {
          onSuccess: () => { toast.success('Tier updated'); onOpenChange(false) },
          onError: (err) => toast.error(err.message || 'Failed to update'),
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success('Tier created'); onOpenChange(false) },
        onError: (err) => toast.error(err.message || 'Failed to create'),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setForm(defaultForm) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Pricing Tier' : 'Add Pricing Tier'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">Name *</Label>
            <Input value={form.name} onChange={set('name')} placeholder="e.g. Deluxe King Room" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide">Price / night *</Label>
              <Input value={form.price} onChange={set('price')} type="number" min="0" step="0.01" placeholder="0.00" className="rounded-xl" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide">Sort order</Label>
              <Input value={form.sortOrder} onChange={set('sortOrder')} type="number" min="0" placeholder="0" className="rounded-xl" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">Tags <span className="font-normal text-gray-400">(comma-separated)</span></Label>
            <Input value={form.tagsRaw} onChange={set('tagsRaw')} placeholder="Sea View, King Bed, Ensuite" className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">Badge</Label>
            <Select value={form.badge} onValueChange={(v) => setForm((p) => ({ ...p, badge: v }))}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {BADGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">Description</Label>
            <Textarea value={form.description} onChange={set('description')} placeholder="Optional short description..." rows={2} className="resize-none rounded-xl" />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-full bg-[#ff4a26] hover:bg-[#e03a18]" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : isEditing ? 'Save changes' : 'Add tier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface Props {
  listingId: string
  listingTitle?: string
}

export function PricingManager({ listingId, listingTitle }: Props) {
  const { data: pricings, isLoading } = useListingPricings(listingId)
  const deleteMutation = useDeleteListingPricing(listingId)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ListingPricing | null>(null)

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (t: ListingPricing) => { setEditing(t); setFormOpen(true) }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Tier deleted'),
      onError: () => toast.error('Failed to delete tier'),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineTag className="text-[#ff4a26]" />
            Pricing Tiers
          </h3>
          {listingTitle && <p className="text-xs text-gray-400 mt-0.5">{listingTitle}</p>}
        </div>
        <Button
          size="sm"
          className="rounded-full bg-[#ff4a26] hover:bg-[#e03a18] text-xs h-8 px-4"
          onClick={openCreate}
        >
          <HiOutlinePlus className="mr-1" /> Add tier
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !pricings || pricings.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <HiOutlineTag className="text-3xl text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">No pricing tiers yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Add room types or packages to offer guests different options.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl overflow-hidden">
          {pricings.map((tier) => (
            <div key={tier.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/60 transition-colors">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{tier.name}</span>
                  {tier.badge && (
                    <Badge variant={BADGE_VARIANT[tier.badge] ?? 'secondary'} className="text-[10px] h-4 px-1.5">
                      {tier.badge.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                {tier.tags.length > 0 && (
                  <p className="text-xs text-gray-400 truncate">{tier.tags.join(' · ')}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-gray-900">${tier.price.toFixed(2)}/night</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full text-gray-400 hover:text-[#ff4a26]"
                  onClick={() => openEdit(tier)}
                >
                  <HiOutlinePencil className="text-sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full text-gray-400 hover:text-red-500"
                  onClick={() => handleDelete(tier.id)}
                  disabled={deleteMutation.isPending}
                >
                  <HiOutlineTrash className="text-sm" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PricingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        listingId={listingId}
        editing={editing}
      />
    </div>
  )
}
