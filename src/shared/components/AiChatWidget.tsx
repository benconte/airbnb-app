import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineSparkles, HiXMark, HiOutlineChatBubbleLeftRight, HiPaperAirplane, HiOutlineStar, HiOutlineMapPin } from 'react-icons/hi2'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { useAuth } from '../../features/auth/hooks/useAuth'

// ── Types ──────────────────────────────────────────────────────────────────────

interface ListingSnippet {
  id: string
  title: string
  location: string
  pricePerNight: number
  type: string
  guests: number
  rating: number | null
  photo: string | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  listings?: ListingSnippet[]
}

// ── Extract content from LangChain AIMessage or plain string ──────────────────
// The backend may return a serialised LangChain AIMessage object:
// { reply: { kwargs: { content: "…" } } }  OR  { reply: "plain string" }
function extractReplyContent(reply: unknown): string {
  if (typeof reply === 'string') return reply
  if (reply && typeof reply === 'object') {
    const r = reply as Record<string, unknown>
    // LangChain serialised AIMessage
    if (r.kwargs && typeof (r.kwargs as Record<string, unknown>).content === 'string') {
      return (r.kwargs as Record<string, unknown>).content as string
    }
    // Fallback: direct .content or .text
    if (typeof r.content === 'string') return r.content
    if (typeof r.text === 'string') return r.text
  }
  return 'Sorry, I could not process that response.'
}

// ── Listing cards ──────────────────────────────────────────────────────────────

function ListingCards({ listings }: { listings: ListingSnippet[] }) {
  if (!listings.length) return null
  return (
    <div className="mt-2 flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {listings.map(l => (
        <Link
          key={l.id}
          to={`/listing/${l.id}`}
          className="shrink-0 w-44 rounded-xl border border-border overflow-hidden hover:border-[#ff4a26]/50
            hover:shadow-md transition-all duration-200 bg-card no-underline group block"
        >
          {/* Photo */}
          <div className="h-24 bg-muted overflow-hidden">
            {l.photo
              ? <img src={l.photo} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
            }
          </div>
          {/* Info */}
          <div className="p-2">
            <p className="text-xs font-semibold text-card-foreground truncate group-hover:text-[#ff4a26] transition-colors">{l.title}</p>
            <p className="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-0.5 truncate">
              <HiOutlineMapPin className="shrink-0" />{l.location}
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs font-bold text-[#ff4a26]">${l.pricePerNight}<span className="text-[10px] font-normal text-muted-foreground">/night</span></span>
              {l.rating && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <HiOutlineStar className="text-yellow-500" />{l.rating}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ── Markdown-ish renderer ──────────────────────────────────────────────────────

function MessageContent({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />

        // Bold **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        )

        // Section headers ###
        if (line.trim().startsWith('###')) {
          return <div key={i} className="font-bold mt-2 text-sm">{line.replace(/^#+\s*/, '')}</div>
        }
        // Bullet points
        if (/^(\s*[-•])\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-primary mt-0.5 shrink-0 text-xs">•</span>
              <span>{parts}</span>
            </div>
          )
        }
        // Numbered list
        if (/^\d+\./.test(line.trim())) {
          return <div key={i} className="flex gap-2 items-start">{parts}</div>
        }

        return <div key={i}>{parts}</div>
      })}
    </div>
  )
}

// ── Suggestion chips ───────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { emoji: '🏠', text: 'Find a villa in Cape Town' },
  { emoji: '📋', text: 'How do bookings work?' },
  { emoji: '⚖️', text: 'How do I file a dispute?' },
  { emoji: '💰', text: 'Listings under $100/night' },
  { emoji: '🔍', text: 'Show apartments for 2 guests' },
]

// ── Main Widget ────────────────────────────────────────────────────────────────

export function AiChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
  const [hasGreeted, setHasGreeted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Send initial greeting when chat opens for first time
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true)
      const greeting = user
        ? `Hi ${user.name?.split(' ')[0]}! 👋 I'm **StayBot**, your personal travel assistant.\n\nI can help you with:\n- 🏠 Finding the perfect listing\n- 📋 Understanding how bookings work\n- ⚖️ Filing or checking on disputes\n- 🗺️ Navigating the platform\n\nWhat are you looking for today?`
        : `Hi there! 👋 I'm **StayBot**, your personal travel assistant on StayHub.\n\nI can help you:\n- 🏠 Find listings that match your needs\n- 📋 Understand our booking system\n- ⚖️ Handle disputes\n- 🗺️ Navigate the platform\n\nWhat can I help you with today?`

      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }])
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, hasGreeted, user])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()
      // Handle both plain string and LangChain serialised AIMessage
      const replyContent = extractReplyContent(data.reply)

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
        listings: (data.listings as ListingSnippet[] | undefined) ?? [],
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isLoading, sessionId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const showSuggestions = messages.length <= 1 && !isLoading

  return (
    <>
      {/* ── Floating button ── */}
      <button
        id="ai-chat-toggle-btn"
        onClick={() => setIsOpen(o => !o)}
        aria-label="Toggle AI Chat"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer
          ${isOpen
            ? 'bg-muted text-foreground hover:bg-muted/80'
            : 'bg-linear-to-br from-[#ff4a26] to-[#ff7043] text-white hover:scale-110 hover:shadow-[#ff4a26]/40'
          }`}
      >
        {isOpen
          ? <HiXMark className="w-6 h-6" />
          : (
            <>
              <HiOutlineSparkles className="w-6 h-6" />
              <span className="absolute inset-0 rounded-full bg-[#ff4a26]/30 animate-ping" />
            </>
          )
        }
      </button>

      {/* ── Chat panel ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[390px] max-w-[calc(100vw-24px)]
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <Card className="flex flex-col overflow-hidden shadow-2xl border-border/60 rounded-2xl p-0"
          style={{ height: '560px' }}>

          {/* ── Header ── */}
          <CardHeader className="p-0 shrink-0">
            <div className="flex items-center gap-3 px-4 py-3.5 bg-linear-to-r from-[#ff4a26] to-[#ff6b47]">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm leading-tight">StayBot</p>
                <p className="text-white/70 text-xs">AI Help Desk · Always here</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <Badge variant="secondary" className="text-[10px] bg-white/20 text-white border-0 hover:bg-white/20">
                  Online
                </Badge>
              </div>
            </div>
          </CardHeader>

          {/* ── Messages ── */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-hidden px-4 py-3" ref={scrollAreaRef}>
              <div className="space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className="flex flex-col gap-1">
                    <div className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5
              ${msg.role === 'user'
                          ? 'bg-linear-to-br from-[#ff4a26] to-[#ff7043] text-white'
                          : 'bg-muted border border-border text-[#ff4a26]'
                        }`}>
                        {msg.role === 'user' ? (user?.name?.slice(0, 1).toUpperCase() ?? 'U') : '✦'}
                      </div>
                      {/* Bubble */}
                      <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5
              ${msg.role === 'user'
                          ? 'bg-linear-to-br from-[#ff4a26] to-[#ff6b47] text-white rounded-tr-sm'
                          : 'bg-card border border-border shadow-sm text-card-foreground rounded-tl-sm'
                        }`}>
                        <MessageContent text={msg.content} />
                        <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-muted-foreground'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Listing cards — uses negative margin to escape px-4 padding, then re-adds it */}
                    {msg.role === 'assistant' && msg.listings && msg.listings.length > 0 && (
                      <div className="ml-9 -mr-4 overflow-x-auto">
                        <div className="pr-4">
                          <ListingCards listings={msg.listings} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-xs text-[#ff4a26] font-bold shrink-0">
                      ✦
                    </div>
                    <div className="bg-card border border-border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-[#ff4a26] animate-spin" />
                      <span className="text-xs text-muted-foreground italic">StayBot is thinking…</span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>
          </CardContent>

          {/* ── Suggestions ── */}
          {showSuggestions && (
            <>
              <Separator />
              <div className="px-3 py-2.5 shrink-0 bg-muted/30">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Quick questions
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.text}
                      onClick={() => sendMessage(s.text)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-background text-[#ff4a26] border border-orange-200
                        hover:bg-[#ff4a26] hover:text-white hover:border-[#ff4a26] transition-colors cursor-pointer font-medium whitespace-nowrap"
                    >
                      {s.emoji} {s.text}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Input ── */}
          <Separator />
          <div className="px-3 py-3 shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                id="ai-chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                disabled={isLoading}
                className="flex-1 h-9 rounded-xl border-border focus-visible:ring-[#ff4a26]/30 focus-visible:border-[#ff4a26] text-sm"
              />
              <Button
                id="ai-chat-send-btn"
                type="button"
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="h-9 w-9 rounded-xl bg-[#ff4a26] hover:bg-[#e03e20] text-white shrink-0 disabled:opacity-40 cursor-pointer"
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <HiPaperAirplane className="w-4 h-4" />
                }
              </Button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-1.5">
              Powered by StayHub AI
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}
