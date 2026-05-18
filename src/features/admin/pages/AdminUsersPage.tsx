import { useState } from 'react'
import { toast } from 'sonner'
import {
  HiOutlineUsers,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineHome,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineFunnel,
} from 'react-icons/hi2'
import { useAdminUsers, useDeleteUser, useUpdateUser } from '../hooks/useAdminData'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import type { AdminUser, AdminRole } from '../types/admin'

const ROLES: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'HOST', 'GUEST']

function roleBadge(role: AdminRole) {
  const styles = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    ADMIN: 'bg-[#ff4a26]/10 text-[#ff4a26] border-[#ff4a26]/20',
    HOST: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    GUEST: 'bg-gray-50 text-gray-500 border-gray-200',
  }
  const icons = {
    SUPER_ADMIN: HiOutlineShieldCheck,
    ADMIN: HiOutlineShieldCheck,
    HOST: HiOutlineHome,
    GUEST: HiOutlineUsers,
  }
  return { style: styles[role], Icon: icons[role] }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function AdminUsersPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<AdminRole | ''>('')
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [editRole, setEditRole] = useState<AdminRole>('GUEST')
  const [editBlocked, setEditBlocked] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBio, setEditBio] = useState('')

  const { data, isLoading } = useAdminUsers(page, 10, roleFilter || undefined)
  const deleteMutation = useDeleteUser()
  const updateMutation = useUpdateUser()

  const handleEdit = (u: AdminUser) => {
    setEditTarget(u)
    setEditRole(u.role)
    setEditBlocked(u.isBlocked)
    setEditName(u.name)
    setEditPhone(u.phone ?? '')
    setEditBio(u.bio ?? '')
  }

  const handleSaveEdit = () => {
    if (!editTarget) return
    updateMutation.mutate({ id: editTarget.id, data: { role: editRole, isBlocked: editBlocked, name: editName, phone: editPhone, bio: editBio } }, {
      onSuccess: () => {
        toast.success(`User updated.`)
        setEditTarget(null)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const filtered = data?.data.filter(u =>
    search === '' ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`User "${deleteTarget.name}" deleted.`)
        setDeleteTarget(null)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const totalPages = data?.meta.totalPages ?? 1

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <HiOutlineUsers className="text-base" />
            <span>User Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">All Users</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.meta.total ?? 0} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                placeholder="Search by name, email, username…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] focus:bg-white transition-all"
              />
            </div>
            {/* Role Filter */}
            <div className="relative">
              <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
              <select
                value={roleFilter}
                onChange={e => { setRoleFilter(e.target.value as AdminRole | ''); setPage(1) }}
                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] appearance-none cursor-pointer"
              >
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-0 px-6 pt-5">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#ff4a26] rounded-full" />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-gray-50/60">
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider pl-6">#</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">User</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Email</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Role</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Listings</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Joined</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-gray-100">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-full max-w-[120px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                  : filtered.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16 text-gray-400">
                          <HiOutlineUsers className="text-4xl mx-auto mb-2 opacity-30" />
                          No users found
                        </TableCell>
                      </TableRow>
                    )
                    : filtered.map((u, idx) => {
                      const { style, Icon } = roleBadge(u.role)
                      return (
                        <TableRow key={u.id} className="border-gray-100 hover:bg-gray-50/60 transition-colors">
                          <TableCell className="pl-6 text-gray-400 text-sm font-medium">
                            {String((page - 1) * 10 + idx + 1).padStart(2, '0')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                                <p className="text-xs text-gray-400">@{u.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{u.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
                              <Icon className="text-xs" />
                              {u.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{u._count?.listings ?? 0}</TableCell>
                          <TableCell className="text-sm text-gray-400">{fmtDate(u.createdAt)}</TableCell>
                          <TableCell className="pr-6 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleEdit(u)}
                              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              disabled={u.role === 'SUPER_ADMIN' || (!isSuperAdmin && u.role === 'ADMIN')}
                              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors"
                            >
                              <HiOutlineTrash className="text-sm" /> Delete
                            </button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                }
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.meta.total)} of {data.meta.total} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <HiChevronLeft className="text-sm" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === p ? 'bg-[#ff4a26] text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <HiChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Delete User?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>?
            This will also remove all their listings and bookings. This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4a26]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Phone</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4a26]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4a26] min-h-[80px]"
              />
            </div>
            {isSuperAdmin && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminRole)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4a26]"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isBlocked"
                checked={editBlocked}
                onChange={(e) => setEditBlocked(e.target.checked)}
                className="w-4 h-4 text-[#ff4a26] focus:ring-[#ff4a26] border-gray-300 rounded"
              />
              <label htmlFor="isBlocked" className="text-sm font-semibold text-gray-700">Account Blocked</label>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditTarget(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="bg-[#ff4a26] hover:bg-[#e03a18] text-white rounded-xl"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
