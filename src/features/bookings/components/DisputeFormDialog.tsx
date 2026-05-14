import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/dialog'
import { Button } from '../../../shared/ui/button'
import { Input } from '../../../shared/ui/input'
import { Textarea } from '../../../shared/ui/textarea'
import { Label } from '../../../shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select'

// DisputeReason enum values mirroring the backend
const DISPUTE_REASONS = [
  { value: 'PROPERTY_CONDITION', label: 'Property condition' },
  { value: 'PAYMENT_ISSUE', label: 'Payment issue' },
  { value: 'HOST_BEHAVIOUR', label: 'Host behaviour' },
  { value: 'GUEST_BEHAVIOUR', label: 'Guest behaviour' },
  { value: 'CANCELLATION_POLICY', label: 'Cancellation policy' },
  { value: 'OTHER', label: 'Other' },
] as const

type DisputeReason = (typeof DISPUTE_REASONS)[number]['value']

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  bookingId: string
  /** Who is filing: GUEST (against host) or HOST (against guest) */
  role: 'GUEST' | 'HOST'
}

export function DisputeFormDialog({ open, onOpenChange, bookingId, role }: Props) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reason, setReason] = useState<DisputeReason | ''>('')

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      api.post('/api/v1/disputes', {
        bookingId,
        title,
        description,
        reason: reason || 'OTHER',
        // againstRole is determined server-side based on who filed, but we hint it
        againstRole: role === 'GUEST' ? 'HOST' : 'GUEST',
      }),
    onSuccess: () => {
      toast.success('Dispute filed successfully', {
        description: 'Our team will review it shortly.',
      })
      onOpenChange(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['my-disputes'] })
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to file dispute')
    },
  })

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setReason('')
  }

  const againstLabel = role === 'GUEST' ? 'about the host' : 'about the guest'

  // Filter reasons based on who is filing
  const availableReasons = DISPUTE_REASONS.filter((r) => {
    if (role === 'HOST') {
      // Hosts typically file about guest behaviour / payment
      return ['GUEST_BEHAVIOUR', 'PAYMENT_ISSUE', 'PROPERTY_CONDITION', 'OTHER'].includes(r.value)
    }
    // Guests can file about everything except guest behaviour
    return r.value !== 'GUEST_BEHAVIOUR'
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>File a Dispute</DialogTitle>
          <DialogDescription>
            Submit a dispute {againstLabel} regarding this booking. Our team will review it within 24–48 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold">Dispute title <span className="text-red-500">*</span></Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue..."
              className="rounded-xl"
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold">Reason <span className="text-red-500">*</span></Label>
            <Select value={reason} onValueChange={(v) => setReason(v as DisputeReason)}>
              <SelectTrigger className="rounded-xl cursor-pointer">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {availableReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value} className='cursor-pointer'>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold">Full description <span className="text-red-500">*</span></Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail. Include dates, amounts, and any evidence you have..."
              rows={5}
              className="resize-none rounded-xl"
            />
            <p className="text-xs text-gray-400">{description.length}/1000 characters</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => { onOpenChange(false); resetForm() }}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full bg-[#ff4a26] hover:bg-[#e03a18]"
            onClick={() => mutate()}
            disabled={
              isPending ||
              !title.trim() ||
              !description.trim() ||
              !reason
            }
          >
            {isPending ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
