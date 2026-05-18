import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { format } from 'date-fns'
import { HiOutlinePaperAirplane, HiOutlinePhoto, HiXMark, HiOutlineShieldExclamation } from 'react-icons/hi2'
import { useDisputeMessages, useSendDisputeMessage } from '../disputes/useDisputeHooks'
import type { Dispute } from '../disputes/types'
import { STATUS_CONFIG } from '../disputes/types'

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg, currentUserId }: {
  msg: { id: string; body: string | null; imageUrls: string[]; createdAt: string; sender: { id: string; name: string; avatar: string | null; role: string } }
  currentUserId: string
}) {
  const isMine = msg.sender.id === currentUserId
  const isAdmin = msg.sender.role === 'ADMIN' || msg.sender.role === 'SUPER_ADMIN'
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <>
      <div className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="shrink-0">
          {msg.sender.avatar ? (
            <img src={msg.sender.avatar} alt={msg.sender.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm
              ${isAdmin ? 'bg-purple-500' : isMine ? 'bg-[#ff4a26]' : 'bg-gray-400'}`}>
              {msg.sender.name[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Bubble */}
        <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-600">{msg.sender.name}</span>
            {isAdmin && (
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>

          <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed
            ${isMine
              ? 'bg-[#ff4a26] text-white rounded-tr-sm'
              : isAdmin
                ? 'bg-purple-50 border border-purple-100 text-gray-800 rounded-tl-sm'
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
            {msg.body && <p>{msg.body}</p>}
          </div>

          {/* Evidence images */}
          {msg.imageUrls.length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {msg.imageUrls.map((url, i) => (
                <button key={i} onClick={() => setLightbox(url)} className="cursor-pointer">
                  <img src={url} alt={`Evidence ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity shadow-sm" />
                </button>
              ))}
            </div>
          )}

          <span className="text-[10px] text-gray-400 mt-0.5">
            {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
          </span>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Evidence" className="max-w-full max-h-full rounded-xl object-contain" />
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <HiXMark className="text-xl" />
          </button>
        </div>
      )}
    </>
  )
}

// ── Compose box ───────────────────────────────────────────────────────────────

function ComposeBox({ disputeId, closed }: { disputeId: string; closed: boolean }) {
  const [text, setText] = useState('')
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const send = useSendDisputeMessage(disputeId)

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - previews.length)
    const newPreviews = files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setPreviews(p => [...p, ...newPreviews].slice(0, 5))
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(idx: number) {
    setPreviews(p => { URL.revokeObjectURL(p[idx].url); return p.filter((_, i) => i !== idx) })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim() && previews.length === 0) return

    const form = new FormData()
    if (text.trim()) form.append('body', text.trim())
    previews.forEach(p => form.append('images', p.file))

    try {
      await send.mutateAsync(form)
      setText('')
      setPreviews([])
    } catch { /* handled by mutation */ }
  }

  if (closed) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl text-sm text-gray-400">
        <HiOutlineShieldExclamation className="text-base text-gray-300" />
        This dispute is closed. No further messages can be sent.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 bg-white rounded-b-2xl">
      {/* Image previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative">
              <img src={p.url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs hover:bg-red-500 transition-colors">
                <HiXMark />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button type="button" onClick={() => fileRef.current?.click()}
          disabled={previews.length >= 5}
          className="cursor-pointer shrink-0 w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <HiOutlinePhoto className="text-lg" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a message or attach evidence images…"
          rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any) } }}
          className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] transition-all min-h-[38px] max-h-32"
          style={{ fieldSizing: 'content' } as any}
        />

        <button type="submit" disabled={send.isPending || (!text.trim() && previews.length === 0)}
          className="cursor-pointer shrink-0 w-9 h-9 rounded-xl bg-[#ff4a26] flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e03e1e] transition-colors shadow-sm">
          {send.isPending ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <HiOutlinePaperAirplane className="text-base" />
          )}
        </button>
      </div>
    </form>
  )
}

// ── Main DisputeThread ─────────────────────────────────────────────────────────

export function DisputeThread({ dispute, currentUserId }: { dispute: Dispute; currentUserId: string }) {
  const { data, isLoading } = useDisputeMessages(dispute.id)
  const messages = data?.data ?? []
  const bottomRef = useRef<HTMLDivElement>(null)
  const isClosed = dispute.status === 'RESOLVED' || dispute.status === 'DISMISSED'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50/40 overflow-hidden">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: STATUS_CONFIG[dispute.status].dot }} />
        <span className="text-sm font-semibold text-gray-700">Dispute Thread</span>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[dispute.status].className}`}>
          {STATUS_CONFIG[dispute.status].label}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-[280px] max-h-[420px]">
        {/* Opening message */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 text-sm text-gray-600 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Original Dispute Description</p>
          <p className="leading-relaxed">{dispute.description}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="w-5 h-5 border-2 border-[#ff4a26]/30 border-t-[#ff4a26] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-4">No messages yet. Start the conversation below.</p>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Admin resolution note */}
      {dispute.resolution && (
        <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
          <p className="text-xs font-bold text-emerald-700 mb-1">✓ Admin Resolution</p>
          <p className="text-sm text-emerald-800 leading-relaxed">{dispute.resolution}</p>
        </div>
      )}

      <ComposeBox disputeId={dispute.id} closed={isClosed} />
    </div>
  )
}
