import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { api } from '../../../lib/api'
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiArrowRightOnRectangle,
  HiOutlinePencil,
  HiCheckCircle,
} from 'react-icons/hi2'
import type { User } from '../types'

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ADMIN: { label: 'Administrator', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  HOST: { label: 'Host', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  GUEST: { label: 'Guest', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
}

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
  const initials = user.name?.slice(0, 2).toUpperCase() ?? '??'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 pb-20">
      {/* Hero banner */}
      <div className="h-40 bg-gradient-to-r from-[#ff4a26] via-[#ff6b4a] to-[#ff8c6a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.4%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        {/* Avatar card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-end gap-5 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ff4a26] to-[#ff8c6a] flex items-center justify-center text-3xl font-black text-white shadow-lg border-4 border-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleInfo.bg} ${roleInfo.color} ${roleInfo.border}`}
                >
                  <HiOutlineShieldCheck className="text-sm" />
                  {roleInfo.label}
                </span>
              </div>
              <p className="text-sm text-gray-400">@{user.username}</p>
            </div>

            {/* Edit toggle */}
            <button
              id="edit-profile-btn"
              onClick={() => setEditing((e) => !e)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#ff4a26] border border-gray-200 hover:border-[#ff4a26] rounded-full px-4 py-2 transition-colors duration-200 cursor-pointer shrink-0"
            >
              <HiOutlinePencil />
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Info fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoField
              icon={<HiOutlineEnvelope />}
              label="Email address"
              value={user.email}
              locked
            />
            <InfoField
              icon={<HiOutlineUser />}
              label="Full name"
              value={form.name}
              editing={editing}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <InfoField
              icon={<HiOutlinePhone />}
              label="Phone number"
              value={form.phone}
              editing={editing}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            />
            <InfoField icon={<HiOutlineShieldCheck />} label="Account role" value={roleInfo.label} locked />
          </div>

          {/* Save button */}
          {editing && (
            <div className="mt-6 flex justify-end">
              <button
                id="save-profile-btn"
                onClick={handleSave}
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

        {/* Role-specific shortcuts */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Quick links</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {role === 'HOST' && (
              <>
                <ShortcutCard href="/dashboard" label="Host Dashboard" description="Manage your listings & bookings" emoji="🏠" />
                <ShortcutCard href="/add-listing" label="Add Listing" description="List a new property" emoji="➕" />
              </>
            )}
            {role === 'ADMIN' && (
              <ShortcutCard href="/admin" label="Admin Portal" description="Manage users, disputes & content" emoji="🛡️" />
            )}
            {(role === 'GUEST' || !role) && (
              <>
                <ShortcutCard href="/trips" label="My Trips" description="View past & upcoming bookings" emoji="✈️" />
                <ShortcutCard href="/wishlists" label="Wishlists" description="Saved listings" emoji="❤️" />
              </>
            )}
            <ShortcutCard href="/settings" label="Settings" description="Notifications & privacy" emoji="⚙️" />
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Account</h2>
          <button
            id="logout-profile-btn"
            onClick={handleLogout}
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

/* ---------- sub-components ---------- */

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
}: {
  href: string
  label: string
  description: string
  emoji: string
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-[#ff4a26]/30 hover:bg-orange-50/30 transition-all duration-200 no-underline group cursor-pointer"
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#ff4a26] transition-colors">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </Link>
  )
}
