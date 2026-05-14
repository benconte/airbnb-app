import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiArrowRightOnRectangle,
  HiOutlinePencil,
  HiCheckCircle,
  HiOutlineHome,
  HiOutlineTicket,
  HiOutlineHeart,
  HiOutlineShieldExclamation,
  HiOutlineSquares2X2,
  HiOutlinePlusCircle,
  HiOutlineChartBar,
  HiOutlineCalendarDays,
  HiOutlineUsers,
  HiOutlineBuildingStorefront,
  HiOutlineDocumentText,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineGlobeAlt,
} from 'react-icons/hi2'
import type { User } from '../types'

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; gradient: string }> = {
  ADMIN: {
    label: 'Administrator',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    gradient: 'from-purple-600 via-purple-500 to-indigo-600',
  },
  HOST: {
    label: 'Host',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
  },
  GUEST: {
    label: 'Guest',
    color: 'text-[#ff4a26]',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    gradient: 'from-[#ff4a26] via-[#ff6b4a] to-[#ff8c6a]',
  },
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function InfoField({
  icon,
  label,
  value,
  editing = false,
  locked = false,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  value: string
  editing?: boolean
  locked?: boolean
  onChange?: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <span className="text-sm">{icon}</span>
        {label}
        {locked && <span className="text-[10px] text-gray-300 ml-auto">locked</span>}
      </label>
      {editing && !locked ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-10 rounded-xl border border-[#ff4a26]/50 bg-orange-50/30 px-3.5 text-sm text-gray-900 outline-none focus:border-[#ff4a26] transition-colors"
        />
      ) : (
        <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-xl px-3.5 py-2.5 truncate">{value || '—'}</p>
      )}
    </div>
  )
}

function ShortcutCard({
  href,
  label,
  description,
  emoji,
  badge,
}: {
  href: string
  label: string
  description: string
  emoji: string
  badge?: string
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-[#ff4a26]/30 hover:bg-orange-50/30 transition-all duration-200 no-underline group cursor-pointer"
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#ff4a26] transition-colors truncate">{label}</p>
        <p className="text-xs text-gray-400 truncate">{description}</p>
      </div>
      {badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff4a26] text-white shrink-0">{badge}</span>
      )}
    </Link>
  )
}

function StatCard({
  icon,
  label,
  value,
  color = 'text-gray-900',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 rounded-2xl text-center">
      <div className="text-2xl text-gray-400 mb-1">{icon}</div>
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
    </div>
  )
}

// ── Shared Profile Card ────────────────────────────────────────────────────────

function ProfileCard({
  user,
  form,
  editing,
  saving,
  roleInfo,
  onToggleEdit,
  onSave,
  onFormChange,
}: {
  user: User
  form: { name: string; phone: string }
  editing: boolean
  saving: boolean
  roleInfo: typeof ROLE_CONFIG[string]
  onToggleEdit: () => void
  onSave: () => void
  onFormChange: (key: 'name' | 'phone', value: string) => void
}) {
  const initials = user.name?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
      <div className="flex items-end gap-5 mb-6">
        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${roleInfo.gradient} flex items-center justify-center text-3xl font-black text-white shadow-lg border-4 border-white shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 pb-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleInfo.bg} ${roleInfo.color} ${roleInfo.border}`}>
              <HiOutlineShieldCheck className="text-sm" />
              {roleInfo.label}
            </span>
          </div>
          <p className="text-sm text-gray-400">@{user.username}</p>
        </div>
        <button
          id="edit-profile-btn"
          onClick={onToggleEdit}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#ff4a26] border border-gray-200 hover:border-[#ff4a26] rounded-full px-4 py-2 transition-colors duration-200 cursor-pointer shrink-0"
        >
          <HiOutlinePencil />
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InfoField icon={<HiOutlineEnvelope />} label="Email address" value={user.email} locked />
        <InfoField
          icon={<HiOutlineUser />}
          label="Full name"
          value={form.name}
          editing={editing}
          onChange={(v) => onFormChange('name', v)}
        />
        <InfoField
          icon={<HiOutlinePhone />}
          label="Phone number"
          value={form.phone}
          editing={editing}
          onChange={(v) => onFormChange('phone', v)}
        />
        <InfoField icon={<HiOutlineShieldCheck />} label="Account role" value={roleInfo.label} locked />
      </div>

      {editing && (
        <div className="mt-6 flex justify-end">
          <button
            id="save-profile-btn"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#ff4a26] hover:bg-[#e03d1e] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-full transition-colors duration-200 cursor-pointer"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <HiCheckCircle className="text-lg" />
            )}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Guest Profile Page ─────────────────────────────────────────────────────────

function GuestProfilePage({ user, form, editing, saving, roleInfo, onToggleEdit, onSave, onFormChange, onLogout }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 pb-20">
      <div className="h-40 bg-gradient-to-r from-[#ff4a26] via-[#ff6b4a] to-[#ff8c6a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.4%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/70 text-sm font-medium">
          <HiOutlineGlobeAlt className="text-base" />
          Explore the world, one stay at a time
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <ProfileCard
          user={user} form={form} editing={editing} saving={saving} roleInfo={roleInfo}
          onToggleEdit={onToggleEdit} onSave={onSave} onFormChange={onFormChange}
        />

        {/* Guest quick actions */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Your Travel Hub</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <ShortcutCard href="/trips" label="My Trips" description="View past & upcoming bookings" emoji="✈️" />
            <ShortcutCard href="/wishlists" label="Wishlists" description="Properties you've saved" emoji="❤️" />
            <ShortcutCard href="/listings" label="Browse Listings" description="Find your next stay" emoji="🔍" />
            <ShortcutCard href="/listings" label="Explore Destinations" description="Discover amazing places" emoji="🗺️" />
          </div>
        </div>

        {/* Guest tips */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl border border-orange-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#ff4a26] uppercase tracking-wide mb-3">Guest Tips</h2>
          <ul className="space-y-2.5">
            {[
              { icon: <HiOutlineTicket />, text: 'Booking requests require host approval — you\'ll be notified by email' },
              { icon: <HiOutlineShieldExclamation />, text: 'File a dispute on your Trips page if you encounter any issues' },
              { icon: <HiOutlineHeart />, text: 'Save listings to your wishlist to compare them later' },
              { icon: <HiOutlineCalendarDays />, text: 'Check booking status on the Trips page anytime' },
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-[#ff4a26] text-base mt-0.5 shrink-0">{tip.icon}</span>
                {tip.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Account</h2>
          <button
            id="logout-profile-btn"
            onClick={onLogout}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 font-medium text-sm transition-colors duration-200 cursor-pointer"
          >
            <HiArrowRightOnRectangle className="text-xl" />
            Log out of this account
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Host Profile Page ──────────────────────────────────────────────────────────

function HostProfilePage({ user, form, editing, saving, roleInfo, onToggleEdit, onSave, onFormChange, onLogout }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-20">
      <div className="h-40 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.4%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/70 text-sm font-medium">
          <HiOutlineHome className="text-base" />
          Host your space, earn on your terms
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <ProfileCard
          user={user} form={form} editing={editing} saving={saving} roleInfo={roleInfo}
          onToggleEdit={onToggleEdit} onSave={onSave} onFormChange={onFormChange}
        />

        {/* Host Quick Actions */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Host Dashboard</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <ShortcutCard href="/dashboard" label="Overview" description="View your host dashboard" emoji="📊" />
            <ShortcutCard href="/dashboard/create-listing" label="Add Listing" description="List a new property" emoji="➕" />
            <ShortcutCard href="/dashboard/my-listings" label="My Listings" description="Manage your properties" emoji="🏠" />
            <ShortcutCard href="/dashboard/bookings" label="Bookings" description="Approve or manage requests" emoji="📅" />
            <ShortcutCard href="/dashboard/analytics" label="Analytics" description="Revenue & performance" emoji="📈" />
            <ShortcutCard href="/listings" label="Explore" description="Browse the marketplace" emoji="🔍" />
          </div>
        </div>

        {/* Host stats stub — could be wired to API */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<HiOutlineDocumentText />} label="Listings" value="—" />
            <StatCard icon={<HiOutlineCalendarDays />} label="Bookings" value="—" />
            <StatCard icon={<HiOutlineStar />} label="Avg Rating" value="—" color="text-yellow-500" />
            <StatCard icon={<HiOutlineChartBar />} label="Revenue" value="—" color="text-green-600" />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Visit your <Link to="/dashboard/analytics" className="text-[#ff4a26] font-medium hover:underline">Analytics page</Link> for full stats
          </p>
        </div>

        {/* Host Tips */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border border-blue-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Host Tips</h2>
          <ul className="space-y-2.5">
            {[
              { icon: <HiOutlineClock />, text: 'Respond to booking requests promptly to keep your rating high' },
              { icon: <HiOutlineShieldExclamation />, text: 'Disputes can be filed by guests — admins review and resolve them fairly' },
              { icon: <HiOutlineDocumentText />, text: 'Keep your listing photos and description up to date for more bookings' },
              { icon: <HiOutlineChartBar />, text: 'Monitor your analytics to optimize pricing and availability' },
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-blue-500 text-base mt-0.5 shrink-0">{tip.icon}</span>
                {tip.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Account</h2>
          <button
            id="logout-profile-btn"
            onClick={onLogout}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 font-medium text-sm transition-colors duration-200 cursor-pointer"
          >
            <HiArrowRightOnRectangle className="text-xl" />
            Log out of this account
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Admin Profile Page ─────────────────────────────────────────────────────────

function AdminProfilePage({ user, form, editing, saving, roleInfo, onToggleEdit, onSave, onFormChange, onLogout }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 pb-20">
      <div className="h-40 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.4%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/70 text-sm font-medium">
          <HiOutlineShieldCheck className="text-base" />
          Platform Administrator — Full Access
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <ProfileCard
          user={user} form={form} editing={editing} saving={saving} roleInfo={roleInfo}
          onToggleEdit={onToggleEdit} onSave={onSave} onFormChange={onFormChange}
        />

        {/* Admin Portal */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Admin Portal</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <ShortcutCard href="/admin" label="Admin Dashboard" description="Overview & platform stats" emoji="🛡️" />
            <ShortcutCard href="/admin/users" label="User Management" description="Manage all platform users" emoji="👥" />
            <ShortcutCard href="/admin/listings" label="Listings" description="Review & manage all listings" emoji="🏠" />
            <ShortcutCard href="/admin/bookings" label="Bookings" description="Monitor all bookings" emoji="📅" />
            <ShortcutCard href="/admin/disputes" label="Disputes" description="Review & resolve disputes" emoji="⚖️" />
            <ShortcutCard href="/admin/analytics" label="Analytics" description="Platform-wide analytics" emoji="📊" />
          </div>
        </div>

        {/* Admin Stats */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Platform Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<HiOutlineUsers />} label="Users" value="—" />
            <StatCard icon={<HiOutlineBuildingStorefront />} label="Listings" value="—" />
            <StatCard icon={<HiOutlineCalendarDays />} label="Bookings" value="—" />
            <StatCard icon={<HiOutlineShieldExclamation />} label="Disputes" value="—" color="text-red-500" />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Visit the <Link to="/admin/analytics" className="text-purple-600 font-medium hover:underline">Analytics page</Link> for detailed stats
          </p>
        </div>

        {/* Admin capabilities */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl border border-purple-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">Admin Capabilities</h2>
          <ul className="space-y-2.5">
            {[
              { icon: <HiOutlineUsers />, text: 'Manage all users — ban, unban, change roles' },
              { icon: <HiOutlineBuildingStorefront />, text: 'Review and moderate all platform listings' },
              { icon: <HiOutlineShieldExclamation />, text: 'Review open disputes and provide resolutions' },
              { icon: <HiOutlineChartBar />, text: 'Access full platform analytics and revenue data' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-purple-500 text-base mt-0.5 shrink-0">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Account</h2>
          <button
            id="logout-profile-btn"
            onClick={onLogout}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 font-medium text-sm transition-colors duration-200 cursor-pointer"
          >
            <HiArrowRightOnRectangle className="text-xl" />
            Log out of this account
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ProfilePage (role router) ─────────────────────────────────────────────

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' })

  if (!user) {
    navigate('/login')
    return null
  }

  const role = user.role?.toUpperCase() as keyof typeof ROLE_CONFIG
  const roleInfo = ROLE_CONFIG[role] ?? ROLE_CONFIG['GUEST']

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put<User>(`/api/v1/users/${user.id}`, form)
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err: any) {
      toast.error(err.message || 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const onFormChange = (key: 'name' | 'phone', value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const sharedProps = {
    user,
    form,
    editing,
    saving,
    roleInfo,
    onToggleEdit: () => setEditing((e) => !e),
    onSave: handleSave,
    onFormChange,
    onLogout: handleLogout,
  }

  if (role === 'ADMIN') return <AdminProfilePage {...sharedProps} />
  if (role === 'HOST') return <HostProfilePage {...sharedProps} />
  return <GuestProfilePage {...sharedProps} />
}
