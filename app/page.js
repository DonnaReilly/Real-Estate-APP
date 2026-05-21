'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Sparkles, Search, MapPin, Heart, Share2, Compass, MessageCircleHeart,
  Send, X, ChevronRight, Loader2, TrendingUp, Bookmark, Sun, CloudSun,
  Wallet, Users, Wifi, Footprints, ShieldCheck, Leaf, Coffee, Plane,
  Music, ArrowRight, Globe, ChevronDown, Heart as HeartFilled, Eye, Play,
  CheckCircle2, Circle, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

const PLACEHOLDERS = [
  'a calm beach town for remote work…',
  'a luxury city with nightlife and rooftop bars…',
  'a quiet family area near forests and trails…',
  'a digital nomad community with great cafés…',
  'find cities similar to Bali but cheaper…',
  'an artsy neighborhood for creators and entrepreneurs…',
  'somewhere snowy with a cozy chalet vibe…',
  'a sun-drenched mediterranean town for slow living…',
]

const QUICK_PROMPTS = [
  { icon: '🌊', label: 'Beach + remote work', q: 'A calm beach town for remote work with great wifi, fresh coffee, and a strong community of creatives.' },
  { icon: '🌆', label: 'Luxury nightlife', q: 'A luxury cosmopolitan city with rooftop bars, Michelin restaurants and electric nightlife.' },
  { icon: '🌲', label: 'Nature + family', q: 'A quiet family-friendly area surrounded by nature, hiking trails, top schools and safe streets.' },
  { icon: '💻', label: 'Digital nomad hub', q: 'A digital nomad hotspot with coworking, fast wifi, affordable rent, and an international community.' },
  { icon: '🏝️', label: 'Like Bali', q: 'Find me cities that feel like Bali — tropical, spiritual, affordable and full of wellness culture.' },
  { icon: '🎨', label: 'Creators + founders', q: 'The best neighborhoods for creators and entrepreneurs — energy, talent, design culture and good coffee.' },
]

const TRENDING = [
  { city: 'Lisbon', country: 'Portugal', growth: '+38%', img: 'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=80', tag: 'Digital Nomad' },
  { city: 'Tulum', country: 'Mexico', growth: '+52%', img: 'https://images.unsplash.com/photo-1633149668746-2891c0ff7334?auto=format&fit=crop&w=900&q=80', tag: 'Beach + Wellness' },
  { city: 'Bansko', country: 'Bulgaria', growth: '+41%', img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', tag: 'Mountain Nomad' },
  { city: 'Medellín', country: 'Colombia', growth: '+29%', img: 'https://images.unsplash.com/photo-1531819177115-428566ccfb50?auto=format&fit=crop&w=900&q=80', tag: 'Spring City' },
]

const CHECKLIST = [
  'Apply for long-stay visa',
  'Open international bank account',
  'Lock in 3-month coworking pass',
  'Secure short-term rental',
  'Set up local SIM + eSIM',
  'Health insurance for new region',
  'Schedule arrival airport transfer',
  'Join expat / nomad Slack',
]

const SCORE_META = [
  { key: 'vibe',          label: 'Vibe',        Icon: Sparkles,   color: 'from-fuchsia-400 to-pink-500' },
  { key: 'safety',        label: 'Safety',      Icon: ShieldCheck, color: 'from-emerald-400 to-teal-500' },
  { key: 'walkability',   label: 'Walkability', Icon: Footprints,  color: 'from-sky-400 to-cyan-500' },
  { key: 'social',        label: 'Social',      Icon: Users,       color: 'from-amber-400 to-orange-500' },
  { key: 'remoteWork',    label: 'Remote work', Icon: Wifi,        color: 'from-indigo-400 to-violet-500' },
  { key: 'wellness',      label: 'Wellness',    Icon: Leaf,        color: 'from-lime-400 to-green-500' },
  { key: 'costFriendly',  label: 'Cost',        Icon: Wallet,      color: 'from-rose-400 to-red-500' },
]

// fake-map pin positions
const MAP_PINS = [
  { left: '18%', top: '38%' }, { left: '28%', top: '55%' }, { left: '42%', top: '32%' },
  { left: '52%', top: '48%' }, { left: '64%', top: '38%' }, { left: '74%', top: '58%' },
  { left: '83%', top: '42%' },
]

function MetricBar({ value = 0, color = 'from-fuchsia-400 to-cyan-400' }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
        style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
      />
    </div>
  )
}

function PropertyCard({ n, idx, saved, onSave, onPreview, onShare }) {
  return (
    <div className="group relative gradient-border overflow-hidden rounded-2xl fade-up"
         style={{ animationDelay: `${idx * 90}ms` }}>
      <div className="relative h-56 overflow-hidden rounded-t-2xl">
        <img
          src={n.image}
          alt={n.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="glass rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
            <span className="text-[15px] leading-none">{n.emoji || '✨'}</span>
            <span className="text-white/90">{n.vibe}</span>
          </div>
          <button
            onClick={() => onSave(n)}
            className="glass rounded-full p-2 hover:bg-white/15 transition"
            aria-label="Save"
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-white/70 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {n.city}, {n.country}
            </p>
            <h3 className="text-xl font-semibold text-white mt-0.5">{n.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-white/60">Match</div>
            <div className="text-2xl font-bold gradient-text">{n.matchPercent}%</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-white/70 leading-relaxed line-clamp-3">{n.summary}</p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {SCORE_META.slice(0, 6).map(({ key, label, Icon, color }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/60 flex items-center gap-1"><Icon className="w-3 h-3" />{label}</span>
                <span className="text-white/90 font-medium">{n.scores?.[key] ?? 70}</span>
              </div>
              <MetricBar value={n.scores?.[key] ?? 70} color={color} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(n.tags || []).slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/50">Est. monthly</div>
            <div className="text-lg font-semibold text-white">${n.monthlyCost?.toLocaleString?.() || '—'}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare(n)}
              className="glass rounded-full p-2 hover:bg-white/10"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <Button
              size="sm"
              onClick={() => onPreview(n)}
              className="bg-white text-black hover:bg-white/90 rounded-full font-medium"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-black" />
              Day in life
            </Button>
          </div>
        </div>

        {n.weatherMood && (
          <div className="flex items-center gap-2 text-[11px] text-white/50 pt-1 border-t border-white/5">
            <CloudSun className="w-3.5 h-3.5" /> {n.weatherMood}
            {n.hiddenGem && <span className="ml-auto text-[10px] italic text-fuchsia-300/80">💎 {n.hiddenGem.slice(0, 50)}…</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function FloatingChat({ open, setOpen }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your MoveMatch concierge. Ask me anything — comparing cities, costs, vibe checks, or where to relocate. ✨" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const sessionId = useMemo(() => Math.random().toString(36).slice(2), [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' })
  }, [messages, loading])

  async function send(e) {
    e?.preventDefault?.()
    const text = input.trim()
    if (!text || loading) return
    const history = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message: text, sessionId }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error || 'Hmm, something went wrong.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network hiccup — try again?' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open AI assistant"
      >
        <span className="absolute inset-0 rounded-full pulse-ring bg-fuchsia-500/30" />
        <span className="relative flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-cyan-500 text-white shadow-2xl shadow-fuchsia-500/30 hover:scale-105 transition">
          {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          <span className="text-sm font-medium pr-1">{open ? 'Close' : 'Ask AI'}</span>
        </span>
      </button>

      <div className={`fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[400px] h-[560px] glass-strong rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col transition-all duration-300 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">MoveMatch Concierge</div>
            <div className="text-[11px] text-white/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online · GPT-5
            </div>
          </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-white text-black rounded-br-md' : 'glass text-white/90 rounded-bl-md'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl rounded-bl-md px-3.5 py-2.5">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{animationDelay:'0ms'}} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{animationDelay:'120ms'}} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{animationDelay:'240ms'}} />
                </span>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={send} className="p-3 border-t border-white/10 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Compare Lisbon vs. Bali…"
            className="bg-white/5 border-white/10 rounded-full text-sm focus-visible:ring-fuchsia-400/50"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} className="rounded-full bg-white text-black hover:bg-white/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </>
  )
}

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [results, setResults] = useState(null) // {summary, neighborhoods}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState('home') // home | dashboard
  const [saved, setSaved] = useState([])
  const [chatOpen, setChatOpen] = useState(false)

  const [preview, setPreview] = useState(null) // {neighborhood, loading, data}
  const resultsRef = useRef(null)

  // load saved
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('mm_saved') || '[]')
      setSaved(s)
    } catch {}
  }, [])

  // rotating placeholder
  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 2800)
    return () => clearInterval(id)
  }, [])

  function saveItem(n) {
    setSaved(prev => {
      const exists = prev.find(p => p.id === n.id)
      const next = exists ? prev.filter(p => p.id !== n.id) : [...prev, n]
      try { localStorage.setItem('mm_saved', JSON.stringify(next)) } catch {}
      return next
    })
  }
  function isSaved(id) { return !!saved.find(s => s.id === id) }

  function shareItem(n) {
    const url = `${window.location.origin}/?look=${encodeURIComponent(n.city)}`
    if (navigator.share) {
      navigator.share({ title: `${n.name}, ${n.city}`, text: n.summary, url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url)
      alert('Share link copied!')
    }
  }

  async function runMatch(q) {
    const userQ = (q || prompt).trim()
    if (!userQ) return
    setPrompt(userQ)
    setLoading(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userQ }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Match failed')
      } else {
        setResults(data)
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function openPreview(n) {
    setPreview({ neighborhood: n, loading: true, data: null })
    try {
      const res = await fetch('/api/day-in-life', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborhood: n, prompt }),
      })
      const data = await res.json()
      setPreview({ neighborhood: n, loading: false, data })
    } catch {
      setPreview({ neighborhood: n, loading: false, data: { error: 'Failed' } })
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* background orbs */}
      <div className="orb animate-float bg-fuchsia-600/40" style={{ width: 520, height: 520, top: -120, left: -120 }} />
      <div className="orb animate-float bg-cyan-500/30" style={{ width: 480, height: 480, top: 200, right: -160, animationDelay: '2s' }} />
      <div className="orb animate-float bg-violet-600/30" style={{ width: 380, height: 380, top: 600, left: '40%', animationDelay: '4s' }} />

      {/* NAV */}
      <nav className="sticky top-0 z-40 px-4 sm:px-8 py-4 backdrop-blur-xl bg-black/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setView('home')} className="flex items-center gap-2.5 group">
            <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <Compass className="w-5 h-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight">MoveMatch <span className="gradient-text">AI</span></span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setView('home')} className={`px-4 py-2 text-sm rounded-full transition ${view==='home' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}>Discover</button>
            <button onClick={() => setView('dashboard')} className={`px-4 py-2 text-sm rounded-full transition ${view==='dashboard' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}>
              Dashboard {saved.length > 0 && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-fuchsia-500 text-white">{saved.length}</span>}
            </button>
            <a href="#trending" className="px-4 py-2 text-sm text-white/70 hover:text-white">Trending</a>
            <a href="#map" className="px-4 py-2 text-sm text-white/70 hover:text-white">Map</a>
          </div>

          <Button onClick={() => setChatOpen(true)} className="rounded-full bg-white text-black hover:bg-white/90 text-sm font-medium gap-2">
            <Sparkles className="w-4 h-4" /> Ask AI
          </Button>
        </div>
      </nav>

      {view === 'home' && (
        <>
          {/* HERO */}
          <section className="relative px-4 sm:px-8 pt-16 sm:pt-24 pb-12">
            <div className="max-w-5xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 glass rounded-full px-3.5 py-1.5 mb-7 text-xs text-white/80 fade-up">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Powered by GPT-5 · Real-time lifestyle matching
              </div>

              <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[1.02] fade-up" style={{ animationDelay: '60ms' }}>
                Find your dream
                <br />
                <span className="gradient-text">lifestyle.</span> Not a listing.
              </h1>

              <p className="mt-7 text-base sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed fade-up" style={{ animationDelay: '180ms' }}>
                Skip the filters. Describe how you want to live — our AI matches you to the world's most compatible neighborhoods and homes.
              </p>

              {/* Search bar */}
              <form
                onSubmit={(e) => { e.preventDefault(); runMatch() }}
                className="mt-10 fade-up"
                style={{ animationDelay: '280ms' }}
              >
                <div className="relative gradient-border rounded-2xl p-1.5 flex items-center gap-2 shadow-2xl shadow-fuchsia-500/10">
                  <div className="flex items-center pl-4 pr-1 text-white/40">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={'I want ' + PLACEHOLDERS[placeholderIdx]}
                    className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-base sm:text-lg py-4 placeholder:text-white/30 text-white"
                  />
                  <Button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="rounded-xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-cyan-500 hover:opacity-90 text-white font-medium text-sm sm:text-base px-5 sm:px-6 h-12 sm:h-12 disabled:opacity-50"
                  >
                    {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Matching…</>) :
                      (<><Sparkles className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Find my lifestyle match</span><span className="sm:hidden">Match</span></>)}
                  </Button>
                </div>
              </form>

              {/* quick prompts */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center fade-up" style={{ animationDelay: '360ms' }}>
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => runMatch(p.q)}
                    disabled={loading}
                    className="group glass hover:bg-white/10 rounded-full px-3.5 py-1.5 text-xs sm:text-sm text-white/80 transition flex items-center gap-1.5"
                  >
                    <span>{p.icon}</span> {p.label}
                  </button>
                ))}
              </div>

              {/* mini stats */}
              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs sm:text-sm text-white/40 fade-up" style={{ animationDelay: '480ms' }}>
                <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> 60+ countries</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> 12k+ matches generated</div>
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Real-time AI scoring</div>
                <div className="flex items-center gap-2"><Star className="w-4 h-4" /> 4.9 trusted</div>
              </div>
            </div>
          </section>

          {/* AI RESULTS */}
          <section ref={resultsRef} className="px-4 sm:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              {error && (
                <div className="glass rounded-2xl p-6 text-rose-300 text-center">{error}</div>
              )}

              {loading && !results && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="gradient-border rounded-2xl overflow-hidden">
                      <div className="h-56 shimmer" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 w-2/3 shimmer rounded" />
                        <div className="h-3 w-full shimmer rounded" />
                        <div className="h-3 w-5/6 shimmer rounded" />
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          {[...Array(6)].map((_, j) => <div key={j} className="h-2 shimmer rounded-full" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 fade-up">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-fuchsia-300/80 mb-2 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> AI lifestyle match
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-bold leading-tight max-w-3xl">
                        {results.summary || 'Your dream destinations, ranked.'}
                      </h2>
                      <p className="text-white/50 mt-2 text-sm">Matched against 10k+ neighborhoods worldwide</p>
                    </div>
                    <Button onClick={() => runMatch()} variant="outline" className="border-white/15 bg-white/5 hover:bg-white/10 rounded-full self-start md:self-auto">
                      <Sparkles className="w-3.5 h-3.5 mr-2" /> Regenerate
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.neighborhoods.map((n, i) => (
                      <PropertyCard
                        key={n.id}
                        n={n}
                        idx={i}
                        saved={isSaved(n.id)}
                        onSave={saveItem}
                        onPreview={openPreview}
                        onShare={shareItem}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* TRENDING */}
          <section id="trending" className="px-4 sm:px-8 py-16">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="text-xs uppercase tracking-widest text-cyan-300/80 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Trending right now
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold">Where the world is moving</h2>
                </div>
                <a className="hidden sm:flex text-sm text-white/60 hover:text-white items-center gap-1">See all <ArrowRight className="w-3.5 h-3.5" /></a>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {TRENDING.map((t, i) => (
                  <div key={t.city} className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <img src={t.img} alt={t.city} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute top-3 right-3 glass rounded-full px-2.5 py-1 text-[11px] text-emerald-300 font-semibold">{t.growth}</div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-[11px] text-white/70 uppercase tracking-wider">{t.country}</div>
                      <div className="text-2xl font-bold">{t.city}</div>
                      <div className="text-xs text-white/70 mt-1">{t.tag}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* INTERACTIVE MAP */}
          <section id="map" className="px-4 sm:px-8 py-16">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <div className="text-xs uppercase tracking-widest text-fuchsia-300/80 mb-2 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Live discovery map
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold">Explore by vibe</h2>
              </div>

              <div className="relative gradient-border rounded-3xl overflow-hidden h-[460px]">
                {/* fake-map background */}
                <div className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 25% 35%, rgba(192,132,252,0.35), transparent 35%), radial-gradient(circle at 65% 55%, rgba(103,232,249,0.3), transparent 35%), radial-gradient(circle at 80% 30%, rgba(244,114,182,0.25), transparent 40%)',
                  }}
                />
                <div className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                {/* world silhouette via emoji is too crude. use abstract dots */}
                {[...Array(80)].map((_, i) => (
                  <div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-white/20"
                    style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
                  />
                ))}

                {/* pins */}
                {MAP_PINS.map((p, i) => (
                  <div key={i} className="absolute" style={{ left: p.left, top: p.top }}>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-fuchsia-400/40 pulse-ring" />
                      <div className="relative w-3.5 h-3.5 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 ring-2 ring-white/40 cursor-pointer hover:scale-150 transition" />
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 glass rounded-full px-2.5 py-1 text-[11px] whitespace-nowrap opacity-0 hover:opacity-100 transition pointer-events-none">
                        {['Lisbon','Tulum','Bali','Bansko','Medellín','Lisbon','Cape Town'][i]}
                      </div>
                    </div>
                  </div>
                ))}

                {/* filters */}
                <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                  {['All','Beach','Mountain','City','Nomad','Wellness'].map((f, i) => (
                    <button key={f} className={`glass rounded-full px-3 py-1.5 text-xs ${i === 0 ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10'}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="absolute bottom-5 right-5 glass rounded-2xl p-3 text-xs text-white/70 max-w-xs">
                  <div className="flex items-center gap-2 mb-1.5"><Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /><span className="font-semibold text-white/90">Heatmap legend</span></div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-fuchsia-400" />Premium</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" />Nomad</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Family</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="px-4 sm:px-8 py-12 border-t border-white/5 mt-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-sm text-white/40">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </span>
                <span>MoveMatch AI · © {new Date().getFullYear()}</span>
              </div>
              <div className="flex gap-6">
                <span>Made with GPT-5</span>
                <span>Privacy</span>
                <span>Terms</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {view === 'dashboard' && (
        <DashboardView saved={saved} onUnsave={saveItem} onPreview={openPreview} onShare={shareItem} onGoHome={() => setView('home')} />
      )}

      {/* DAY IN LIFE MODAL */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl bg-zinc-950 border-white/10 text-white p-0 overflow-hidden max-h-[88vh] overflow-y-auto">
          {preview && (
            <div>
              <div className="relative h-56 overflow-hidden">
                <img src={preview.neighborhood.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="text-xs text-white/60 uppercase tracking-widest">A day in</div>
                  <div className="text-3xl font-bold">{preview.neighborhood.name}, {preview.neighborhood.city}</div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {preview.loading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-fuchsia-300 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating immersive preview…
                    </div>
                    {[...Array(4)].map((_,i) => <div key={i} className="h-16 shimmer rounded-xl" />)}
                  </div>
                )}
                {preview.data && !preview.data.error && (
                  <>
                    {[
                      { k: 'morning',   label: 'Morning',   Icon: Sun,      tint: 'from-amber-500/20 to-transparent' },
                      { k: 'midday',    label: 'Midday',    Icon: Coffee,   tint: 'from-orange-500/20 to-transparent' },
                      { k: 'afternoon', label: 'Afternoon', Icon: CloudSun, tint: 'from-pink-500/20 to-transparent' },
                      { k: 'evening',   label: 'Evening',   Icon: Music,    tint: 'from-violet-500/20 to-transparent' },
                    ].map(({ k, label, Icon, tint }) => (
                      preview.data[k] && (
                        <div key={k} className={`relative rounded-2xl p-5 bg-gradient-to-br ${tint} border border-white/5`}>
                          <div className="flex items-center gap-2 mb-2 text-white/90">
                            <Icon className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest font-medium">{label}</span>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed">{preview.data[k]}</p>
                        </div>
                      )
                    ))}
                    {preview.data.soundtrack && (
                      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 text-sm">
                        <Music className="w-4 h-4 text-fuchsia-400" />
                        <span className="text-white/60">Soundtrack:</span>
                        <span className="text-white font-medium">{preview.data.soundtrack}</span>
                      </div>
                    )}
                  </>
                )}
                {preview.data?.error && (
                  <div className="text-rose-300 text-sm">Could not generate. Try again.</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FloatingChat open={chatOpen} setOpen={setChatOpen} />
    </div>
  )
}

function DashboardView({ saved, onUnsave, onPreview, onShare, onGoHome }) {
  const [budget, setBudget] = useState(3500)
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mm_check') || '[]') } catch { return [] }
  })
  function toggle(item) {
    setChecked(prev => {
      const next = prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
      try { localStorage.setItem('mm_check', JSON.stringify(next)) } catch {}
      return next
    })
  }
  const avgCost = saved.length ? Math.round(saved.reduce((a, n) => a + (n.monthlyCost || 0), 0) / saved.length) : 0

  return (
    <div className="relative px-4 sm:px-8 pt-12 pb-24 max-w-7xl mx-auto">
      <div className="mb-10 fade-up">
        <div className="text-xs uppercase tracking-widest text-fuchsia-300/80 mb-2 flex items-center gap-2">
          <Bookmark className="w-3.5 h-3.5" /> Your dashboard
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold">Welcome back, dreamer.</h1>
        <p className="text-white/50 mt-2">Saved places, planning tools and your relocation roadmap.</p>
      </div>

      {/* stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Saved places', value: saved.length, Icon: Heart, color: 'from-rose-400 to-pink-500' },
          { label: 'Avg monthly', value: avgCost ? `$${avgCost.toLocaleString()}` : '—', Icon: Wallet, color: 'from-emerald-400 to-teal-500' },
          { label: 'Checklist done', value: `${checked.length}/${CHECKLIST.length}`, Icon: CheckCircle2, color: 'from-fuchsia-400 to-violet-500' },
          { label: 'AI sessions', value: '12', Icon: Sparkles, color: 'from-cyan-400 to-blue-500' },
        ].map((s, i) => (
          <div key={i} className="gradient-border rounded-2xl p-5 fade-up" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-white/50 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Saved destinations</h2>
            <button onClick={onGoHome} className="text-sm text-fuchsia-300 hover:text-fuchsia-200 flex items-center gap-1">
              Find more <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {saved.length === 0 ? (
            <div className="gradient-border rounded-2xl p-12 text-center">
              <Heart className="w-10 h-10 mx-auto text-white/20 mb-3" />
              <div className="text-white/60">No saved places yet</div>
              <Button onClick={onGoHome} className="mt-4 bg-white text-black hover:bg-white/90 rounded-full">Start matching</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {saved.map((n) => (
                <div key={n.id} className="gradient-border rounded-2xl p-4 flex gap-4 items-center group">
                  <img src={n.image} className="w-24 h-24 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{n.emoji}</span>
                      <div className="font-semibold truncate">{n.name}, {n.city}</div>
                      <span className="ml-auto text-xs gradient-text font-bold">{n.matchPercent}%</span>
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">{n.vibe} · ${n.monthlyCost?.toLocaleString?.()}/mo</div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onPreview(n)} className="h-7 px-2.5 text-xs">
                        <Play className="w-3 h-3 mr-1" /> Preview
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onShare(n)} className="h-7 px-2.5 text-xs">
                        <Share2 className="w-3 h-3 mr-1" /> Share
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onUnsave(n)} className="h-7 px-2.5 text-xs text-rose-300">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* right column */}
        <div className="space-y-6">
          {/* Budget planner */}
          <div className="gradient-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold">Budget planner</h3>
            </div>
            <div className="text-3xl font-bold gradient-text">${budget.toLocaleString()}</div>
            <div className="text-xs text-white/50">target monthly budget</div>
            <input
              type="range"
              min={800}
              max={12000}
              step={100}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full mt-4 accent-fuchsia-500"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>$800</span><span>$12k+</span>
            </div>
            <div className="mt-4 text-xs text-white/60">
              {budget < 1500 && 'Backpacker · SE Asia, Eastern Europe'}
              {budget >= 1500 && budget < 3500 && 'Nomad · Lisbon, Medellín, Bali'}
              {budget >= 3500 && budget < 6500 && 'Comfortable · Barcelona, Mexico City, Tokyo'}
              {budget >= 6500 && 'Luxury · Dubai, NYC, Singapore, London'}
            </div>
          </div>

          {/* Checklist */}
          <div className="gradient-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Plane className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold">Relocation checklist</h3>
            </div>
            <Progress value={(checked.length / CHECKLIST.length) * 100} className="h-1.5 mb-4" />
            <div className="space-y-2">
              {CHECKLIST.map((item) => {
                const on = checked.includes(item)
                return (
                  <button key={item} onClick={() => toggle(item)} className="w-full flex items-center gap-2.5 text-left text-sm py-1 group">
                    {on ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Circle className="w-4 h-4 text-white/30 flex-shrink-0" />}
                    <span className={`${on ? 'line-through text-white/40' : 'text-white/85'} group-hover:text-white transition`}>{item}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
