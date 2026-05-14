import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  HiOutlineMapPin,
  HiOutlineHome,
  HiOutlineSparkles,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlinePhoto,
  HiXMark,
} from 'react-icons/hi2'
import { Loader2 } from 'lucide-react'
import { useCreateListing } from '../hooks/useHostData'
import { Button } from '../../../shared/ui/button'
import { Input } from '../../../shared/ui/input'
import { Label } from '../../../shared/ui/label'
import { Textarea } from '../../../shared/ui/textarea'
import type { CreateListingData, ListingType } from '../types/host'

// ── Constants ─────────────────────────────────────────────────────────────────

const LISTING_TYPES: { value: ListingType; label: string; emoji: string; desc: string }[] = [
  { value: 'APARTMENT', label: 'Apartment', emoji: '🏢', desc: 'A unit in a multi-unit building' },
  { value: 'HOUSE', label: 'House', emoji: '🏠', desc: 'A standalone residential property' },
  { value: 'VILLA', label: 'Villa', emoji: '🏡', desc: 'A luxury or vacation villa' },
  { value: 'CABIN', label: 'Cabin', emoji: '🪵', desc: 'A rustic cabin in nature' },
]

const AMENITY_OPTIONS = [
  'WiFi', 'Kitchen', 'Air conditioning', 'Heating', 'Free parking',
  'Pool', 'Hot tub', 'Washer', 'Dryer', 'TV', 'Work space',
  'Pet-friendly', 'BBQ grill', 'Balcony', 'Ocean view', 'Beach access',
  'Gym', 'Elevator', 'Fireplace', 'EV charger',
]

const STEPS = [
  { id: 1, title: 'Property Type', subtitle: 'What kind of place is it?', icon: HiOutlineHome },
  { id: 2, title: 'Location & Details', subtitle: 'Where is it and who can stay?', icon: HiOutlineMapPin },
  { id: 3, title: 'Amenities', subtitle: 'What do you offer guests?', icon: HiOutlineSparkles },
  { id: 4, title: 'Description & Pricing', subtitle: 'Tell guests about your place', icon: HiOutlineCurrencyDollar },
  { id: 5, title: 'Photos', subtitle: 'Show guests your place', icon: HiOutlinePhoto },
  { id: 6, title: 'Review & Publish', subtitle: 'Almost done!', icon: HiOutlineCheckCircle },
]

// ── Step components ───────────────────────────────────────────────────────────

function StepTypeSelect({
  value,
  onChange,
}: {
  value: ListingType | ''
  onChange: (t: ListingType) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {LISTING_TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${value === t.value
            ? 'border-[#ff4a26] bg-[#ff4a26]/5 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
        >
          <span className="text-3xl leading-none">{t.emoji}</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">{t.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function StepLocationDetails({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<CreateListingData>>['register']
  errors: Record<string, { message?: string }>
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="location" className="text-sm font-semibold text-gray-700 mb-1.5 block">
          Location <span className="text-[#ff4a26]">*</span>
        </Label>
        <div className="relative">
          <HiOutlineMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <Input
            id="location"
            placeholder="e.g. Miami, Florida, USA"
            className="pl-10 h-11 rounded-xl border-gray-200 focus:border-[#ff4a26] focus:ring-[#ff4a26]/20"
            {...register('location', { required: 'Location is required' })}
          />
        </div>
        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="guests" className="text-sm font-semibold text-gray-700 mb-1.5 block">
            Max Guests <span className="text-[#ff4a26]">*</span>
          </Label>
          <Input
            id="guests"
            type="number"
            min={1}
            max={50}
            placeholder="4"
            className="h-11 rounded-xl border-gray-200 focus:border-[#ff4a26] focus:ring-[#ff4a26]/20"
            {...register('guests', {
              required: 'Required',
              min: { value: 1, message: 'Min 1 guest' },
              valueAsNumber: true,
            })}
          />
          {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>}
        </div>

        <div>
          <Label htmlFor="pricePerNight" className="text-sm font-semibold text-gray-700 mb-1.5 block">
            Price / Night (USD) <span className="text-[#ff4a26]">*</span>
          </Label>
          <div className="relative">
            <HiOutlineCurrencyDollar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <Input
              id="pricePerNight"
              type="number"
              min={1}
              step="0.01"
              placeholder="120"
              className="pl-10 h-11 rounded-xl border-gray-200 focus:border-[#ff4a26] focus:ring-[#ff4a26]/20"
              {...register('pricePerNight', {
                required: 'Required',
                min: { value: 1, message: 'Min $1' },
                valueAsNumber: true,
              })}
            />
          </div>
          {errors.pricePerNight && <p className="text-red-500 text-xs mt-1">{errors.pricePerNight.message}</p>}
        </div>
      </div>
    </div>
  )
}

function StepAmenities({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (a: string[]) => void
}) {
  const toggle = (amenity: string) => {
    onChange(
      selected.includes(amenity)
        ? selected.filter(a => a !== amenity)
        : [...selected, amenity],
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Select all that apply. You can update these later.</p>
      <div className="flex flex-wrap gap-2">
        {AMENITY_OPTIONS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => toggle(a)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selected.includes(a)
              ? 'bg-[#ff4a26] text-white border-[#ff4a26] shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
          >
            {a}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">{selected.length} selected</p>
    </div>
  )
}

function StepDescriptionPricing({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<CreateListingData>>['register']
  errors: Record<string, { message?: string }>
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-1.5 block">
          Listing Title <span className="text-[#ff4a26]">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Stunning Beachfront Villa with Ocean Views"
          className="h-11 rounded-xl border-gray-200 focus:border-[#ff4a26] focus:ring-[#ff4a26]/20"
          {...register('title', {
            required: 'Title is required',
            minLength: { value: 10, message: 'At least 10 characters' },
          })}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-1.5 block">
          Description <span className="text-[#ff4a26]">*</span>
        </Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Describe your property: the space, the neighborhood, and what makes it special..."
          className="rounded-xl border-gray-200 focus:border-[#ff4a26] focus:ring-[#ff4a26]/20 resize-none"
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 30, message: 'At least 30 characters' },
          })}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        <p className="text-xs text-gray-400 mt-1">Minimum 30 characters</p>
      </div>
    </div>
  )
}

function StepPhotos({
  photos,
  setPhotos,
}: {
  photos: File[]
  setPhotos: React.Dispatch<React.SetStateAction<File[]>>
}) {
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) {
      setPhotos((prev) => [...prev, ...files])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200">
            <img src={URL.createObjectURL(photo)} alt="" className="w-24 h-24 object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          </div>
        ))}
        <label className="w-24 h-24 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 hover:border-[#ff4a26] hover:bg-[#ff4a26]/5 cursor-pointer transition-colors">
          <HiOutlinePhoto className="w-6 h-6 text-gray-400 mb-1" />
          <span className="text-[10px] text-gray-500 font-medium">Add Photos</span>
          <input type="file" multiple className="hidden" accept="image/*" onChange={handlePhotoSelect} />
        </label>
      </div>
    </div>
  )
}

function StepReview({ data, photosCount }: { data: Partial<CreateListingData>; photosCount: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <HiOutlineCheckCircle className="text-emerald-500 text-2xl shrink-0" />
        <div>
          <p className="font-bold text-emerald-800 text-sm">Almost ready to publish!</p>
          <p className="text-xs text-emerald-700">Review your listing details before submitting.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Type</p>
          <p className="font-bold text-gray-900">{data.type ?? '—'}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Location</p>
          <p className="font-bold text-gray-900 truncate">{data.location ?? '—'}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Price / night</p>
          <p className="font-bold text-gray-900">${data.pricePerNight ?? '—'}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Max guests</p>
          <p className="font-bold text-gray-900">{data.guests ?? '—'}</p>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Title</p>
        <p className="font-bold text-gray-900 text-sm">{data.title ?? '—'}</p>
      </div>

      {data.amenities && data.amenities.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Amenities ({data.amenities.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {data.amenities.map(a => (
              <span key={a} className="px-2.5 py-0.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700">{a}</span>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Photos</p>
        <p className="font-bold text-gray-900 text-sm">{photosCount} photo{photosCount !== 1 ? 's' : ''} added</p>
      </div>
    </div>
  )
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export function CreateListingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState<ListingType | ''>('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<CreateListingData>()
  const createMutation = useCreateListing()

  const canProceedStep1 = selectedType !== ''
  const canProceedStep3 = selectedAmenities.length > 0

  const goNext = () => setCurrentStep(s => Math.min(s + 1, STEPS.length))
  const goPrev = () => setCurrentStep(s => Math.max(s - 1, 1))

  const onSubmit = (formData: CreateListingData) => {
    if (currentStep < STEPS.length) {
      goNext()
      return
    }
    if (!selectedType) return
    const payload: CreateListingData = {
      ...formData,
      type: selectedType,
      amenities: selectedAmenities,
    }
    createMutation.mutate(payload, {
      onSuccess: async (createdListing) => {
        if (selectedPhotos.length > 0) {
          setIsUploading(true)
          try {
            const token = localStorage.getItem('token')
            for (const file of selectedPhotos) {
              const fd = new FormData()
              fd.append('photos', file)
              await fetch(`${import.meta.env.VITE_API_URL}/api/v1/listings/${createdListing.id}/photos`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
              })
            }
          } catch (e) {
            toast.error('Listing created, but failed to upload some photos')
          }
          setIsUploading(false)
        }

        toast.success('Listing created successfully! 🎉')
        navigate('/dashboard/my-listings')
      },
      onError: (err) => {
        toast.error(err.message ?? 'Failed to create listing')
      },
    })
  }

  const currentStepMeta = STEPS[currentStep - 1]
  const StepIcon = currentStepMeta.icon
  const progressPct = (currentStep / STEPS.length) * 100

  return (
    <div className="max-w-2xl mx-auto w-full pb-10">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Create a New Listing</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details to publish your property</p>
      </div>

      {/* ── Stepper ── */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const SIcon = step.icon
          const isActive = currentStep === step.id
          const isDone = currentStep > step.id
          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isActive ? 'bg-[#ff4a26] text-white shadow-md shadow-[#ff4a26]/30' :
                isDone ? 'bg-emerald-100 text-emerald-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                <SIcon className="text-base shrink-0" />
                <span className="hidden sm:block">{step.title}</span>
                <span className="sm:hidden">{step.id}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 rounded-full transition-colors ${isDone ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Progress Bar ── */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ff4a26] to-[#ff7e67] rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Step Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center">
              <StepIcon className="text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Step {currentStep} of {STEPS.length}</p>
              <h2 className="font-bold text-gray-900">{currentStepMeta.title}</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 ml-13">{currentStepMeta.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6">
            {currentStep === 1 && (
              <StepTypeSelect value={selectedType} onChange={setSelectedType} />
            )}
            {currentStep === 2 && (
              <StepLocationDetails register={register} errors={errors as Record<string, { message?: string }>} />
            )}
            {currentStep === 3 && (
              <StepAmenities selected={selectedAmenities} onChange={setSelectedAmenities} />
            )}
            {currentStep === 4 && (
              <StepDescriptionPricing register={register} errors={errors as Record<string, { message?: string }>} />
            )}
            {currentStep === 5 && (
              <StepPhotos photos={selectedPhotos} setPhotos={setSelectedPhotos} />
            )}
            {currentStep === 6 && (
              <StepReview
                data={{
                  ...getValues(),
                  type: selectedType as ListingType,
                  amenities: selectedAmenities,
                }}
                photosCount={selectedPhotos.length}
              />
            )}
          </div>

          {/* ── Footer Navigation ── */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={goPrev}
              disabled={currentStep === 1}
            >
              <HiOutlineChevronLeft className="mr-1.5" /> Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                className="rounded-full bg-[#ff4a26] hover:bg-[#e03e20] text-white shadow-md shadow-[#ff4a26]/20"
                onClick={goNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 3 && !canProceedStep3)
                }
              >
                Continue <HiOutlineChevronRight className="ml-1.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
                disabled={createMutation.isPending || isUploading}
              >
                {(createMutation.isPending || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUploading ? 'Uploading Photos...' : createMutation.isPending ? 'Publishing…' : '🚀 Publish Listing'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
