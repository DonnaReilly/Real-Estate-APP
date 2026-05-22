'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import {
  Compass, Sparkles, ArrowRight, Check, Heart, Wallet, Globe, MessageCircleHeart,
  Wifi, Footprints, ShieldCheck, Users, Leaf, Play, Star, ChevronDown, Menu, X,
  TrendingUp, MapPin, Zap, Trophy, Brain, Search, Plane, Bookmark, Music
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'

const PROPERTIES = [
  { img: 'https://images.unsplash.com/photo-1633149668746-2891c0ff7334?auto=format&fit=crop&w=900&q=80', city: 'Tulum', country: 'Mexico', vibe: 'Beach + Wellness', price: 2400, match: 98 },
  { img: 'https://images.unsplash.com/photo-1607570799395-b968ad047e3f?auto=format&fit=crop&w=900&q=80', city: 'New York', country: 'USA', vibe: 'Luxury + Nightlife', price: 6800, match: 95 },
  { img: 'https://images.unsplash.com/photo-1774803681248-dc3cac13f018?auto=format&fit=crop&w=900&q=80', city: 'Kyoto', country: 'Japan', vibe: 'Zen + Minimal', price: 1900, match: 94 },
  { img: 'https://images.unsplash.com/photo-1531819177115-428566ccfb50?auto=format&fit=crop&w=900&q=80', city: 'Lisbon', country: 'Portugal', vibe: 'Nomad + Sun', price: 1700, match: 96 },
  { img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', city: 'Bansko', country: 'Bulgaria', vibe: 'Mountain Hideout', price: 950, match: 91 },
  { img: 'https://images.unsplash.com/photo-1633250307378-5604b26a164b?auto=format&fit=crop&w=900&q=80', city: 'Dubai', country: 'UAE', vibe: 'Skyline Luxury', price: 5200, match: 93 },
]

const TESTIMONIALS = [
  { name: 'Maya Chen', role: 'Product designer · moved to Lisbon', img: 'https://i.pravatar.cc/120?img=47', quote: 'I just typed "creative city near the ocean with great coffee" and MoveMatch surfaced Lisbon, Porto, and Barcelona — with vibe scores I didn\'t know I needed. I moved 3 months later.' },
  { name: 'David Okafor', role: 'Founder · remote-first startup', img: 'https://i.pravatar.cc/120?img=12', quote: 'The Day-in-the-Life previews are unreal. It\'s like a cinematic Airbnb listing written for who I am, not just where I am.' },
  { name: 'Sara Lindqvist', role: 'Content creator · digital nomad', img: 'https://i.pravatar.cc/120?img=32', quote: 'I\'ve used 6 relocation tools. None come close. MoveMatch is the first that feels intelligent — like a friend who lived in 40 cities.' },
  { name: 'Ravi Mehta', role: 'Engineer · relocated to Tokyo', img: 'https://i.pravatar.cc/120?img=68', quote: 'The budget planner + AI concierge convinced my partner. We compared Tokyo vs Singapore in 5 minutes. Genuinely magical.' },
]

const FEATURES = [
  { Icon: Brain, title: 'GPT-5 lifestyle matching', desc: 'Describe how you want to live in plain English. Our AI ranks 10k+ neighborhoods by compatibility, not filters.', color: 'from-fuchsia-500 to-pink-500' },
  { Icon: Play, title: '"Day in the Life" previews', desc: 'See cinematic morning-to-evening previews for any neighborhood — written by AI tailored to you.', color: 'from-cyan-400 to-blue-500' },
  { Icon: MessageCircleHeart, title: 'Floating AI concierge', desc: 'Multi-turn chat. Compare cities, estimate costs, ask "where would I be happiest" — instantly.', color: 'from-violet-500 to-indigo-500' },
  { Icon: Wallet, title: 'Smart budget planner', desc: 'Lifestyle tier hints from backpacker to luxury. Auto-fit cities to your monthly budget.', color: 'from-emerald-400 to-teal-500' },
  { Icon: Bookmark, title: 'Save & sync everywhere', desc: 'Build your dream destinations list. Syncs across devices once you sign in.', color: 'from-amber-400 to-orange-500' },
  { Icon: Plane, title: 'Relocation roadmap', desc: 'AI-generated checklist tailored to your destination — visas, banking, healthcare, community.', color: 'from-rose-400 to-red-500' },
]

const STEPS = [
  { n: '01', title: 'Describe your dream', desc: 'A sentence or a paragraph. Mood, climate, vibe, work setup — anything.' },
  { n: '02', title: 'AI ranks the world', desc: 'GPT-5 scores 10k+ neighborhoods on 7 lifestyle dimensions in seconds.' },
  { n: '03', title: 'Preview & relocate', desc: 'Cinematic previews, cost estimates, AI concierge, relocation checklist.' },
]

const FAQ = [
  { q: 'How is this different from Zillow or Airbnb?', a: 'Zillow searches by filters (price, beds, square ft). MoveMatch searches by lifestyle compatibility. You describe how you want to live and our AI matches you to neighborhoods — even ones you\'ve never heard of.' },
  { q: 'What AI powers MoveMatch?', a: 'OpenAI\'s GPT-5 (latest generation) powers the lifestyle matching, day-in-the-life previews, and concierge chat. We use reasoning models tuned for travel and lifestyle.' },
  { q: 'Is it free?', a: 'Yes — the Free plan gives you AI matching, day-in-the-life previews and saved destinations. Pro unlocks unlimited matches, budget tools and the AI concierge.' },
  { q: 'Do you list actual properties for sale or rent?', a: 'For now, MoveMatch focuses on lifestyle + neighborhood discovery. Property listings via partners are rolling out in 2026.' },
  { q: 'Where is my data stored?', a: 'Your saved destinations sync to a private account secured by Clerk auth. We never sell your data.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Pro is month-to-month, cancel anytime, no questions asked.' },
]

const LOGOS = ['Forbes', 'TechCrunch', 'The Verge', 'Wired', 'Fast Company', 'Bloomberg']

function MobileMenu({ open, setOpen }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 md:hidden bg-zinc-950/95 backdrop-blur-2xl">
      <div className="p-6 flex items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </span>
          <span className="text-lg font-bold">MoveMatch <span className="gradient-text">AI</span></span>
        </Link>
        <button onClick={() => setOpen(false)} className="p-2">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="p-6 space-y-1">
        {[
          ['Features', '#features'], ['How it works', '#how'], ['Properties', '#properties'],
          ['Testimonials', '#testimonials'], ['Pricing', '#pricing'], ['FAQ', '#faq'],
        ].map(([t, h]) => (
          <a key={t} href={h} onClick={() => setOpen(false)} className="block py-3 text-lg text-white/80 hover:text-white">{t}</a>
        ))}
      </nav>
      <div className="p-6 space-y-3">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" className="w-full border-white/15 bg-white/5">Sign in</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="w-full bg-gradient-to-br from-fuchsia-500 to-cyan-500">Get started free</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/discover"><Button className="w-full bg-gradient-to-br from-fuchsia-500 to-cyan-500">Open app</Button></Link>
        </SignedIn>
      </div>
    </div>
  )
}

function HeroVisual() {
  // Stacked floating card composition for hero
  return (
    <div className="relative h-[520px] w-full hidden lg:block">
      {/* Card 1 - back */}
      <div className="absolute right-12 top-8 w-72 h-96 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 transform rotate-6 fade-up">
        <img src="https://images.unsplash.com/photo-1633149668746-2891c0ff7334?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass rounded-full px-2.5 py-1 inline-block text-[10px] mb-2">🌊 Beach + Coffee</div>
          <div className="text-lg font-bold">Tulum, Mexico</div>
          <div className="text-xs text-white/70">$2,400/mo · 98% match</div>
        </div>
      </div>
      {/* Card 2 - middle */}
      <div className="absolute right-44 top-32 w-72 h-96 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 transform -rotate-3 fade-up" style={{ animationDelay: '120ms' }}>
        <img src="https://images.unsplash.com/photo-1531819177115-428566ccfb50?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass rounded-full px-2.5 py-1 inline-block text-[10px] mb-2">🏛️ Nomad + Sun</div>
          <div className="text-lg font-bold">Lisbon, Portugal</div>
          <div className="text-xs text-white/70">$1,700/mo · 96% match</div>
        </div>
      </div>
      {/* Card 3 - front */}
      <div className="absolute right-0 top-56 w-72 h-96 rounded-3xl overflow-hidden shadow-2xl shadow-fuchsia-500/30 transform rotate-2 fade-up" style={{ animationDelay: '240ms' }}>
        <img src="https://images.unsplash.com/photo-1774803681248-dc3cac13f018?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute top-3 right-3 glass rounded-full px-2 py-1 text-[10px] flex items-center gap-1">
          <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" /> Saved
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass rounded-full px-2.5 py-1 inline-block text-[10px] mb-2">🍃 Zen + Minimal</div>
          <div className="text-lg font-bold">Kyoto, Japan</div>
          <div className="text-xs text-white/70">$1,900/mo · 94% match</div>
        </div>
      </div>
      {/* Floating AI badge */}
      <div className="absolute -bottom-2 -left-4 glass-strong rounded-2xl p-4 shadow-2xl shadow-fuchsia-500/20 max-w-xs fade-up" style={{ animationDelay: '360ms' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold">AI Concierge</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-xs text-white/80 leading-relaxed">"Tulum has stronger surf and coworking, Lisbon wins on community. Want me to compare costs?"</p>
      </div>
    </div>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* background orbs */}
      <div className="orb animate-float bg-fuchsia-600/40" style={{ width: 520, height: 520, top: -120, left: -120 }} />
      <div className="orb animate-float bg-cyan-500/30" style={{ width: 480, height: 480, top: 100, right: -160, animationDelay: '2s' }} />
      <div className="orb animate-float bg-violet-600/25" style={{ width: 380, height: 380, top: 800, left: '40%', animationDelay: '4s' }} />

      {/* ============ NAV ============ */}
      <nav className={`sticky top-0 z-40 px-4 sm:px-8 py-3.5 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl bg-black/50 border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30 group-hover:scale-110 transition">
              <Compass className="w-5 h-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight">MoveMatch <span className="gradient-text">AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-sm text-white/70 hover:text-white transition">Features</a>
            <a href="#how" className="text-sm text-white/70 hover:text-white transition">How it works</a>
            <a href="#properties" className="text-sm text-white/70 hover:text-white transition">Properties</a>
            <a href="#pricing" className="text-sm text-white/70 hover:text-white transition">Pricing</a>
            <a href="#faq" className="text-sm text-white/70 hover:text-white transition">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="hidden sm:inline-flex text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-full">Sign in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="rounded-full bg-white text-black hover:bg-white/90 text-sm font-medium gap-1.5">
                  Get started <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/discover" className="hidden sm:inline-flex">
                <Button className="rounded-full bg-white text-black hover:bg-white/90 text-sm font-medium gap-1.5">
                  Open app <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-2">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
      <MobileMenu open={menuOpen} setOpen={setMenuOpen} />

      {/* ============ HERO ============ */}
      <section className="relative px-4 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 glass rounded-full px-3.5 py-1.5 mb-6 text-xs text-white/85 fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Powered by GPT-5 · Now in beta
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] fade-up" style={{ animationDelay: '60ms' }}>
              Find your dream
              <br />
              <span className="gradient-text">lifestyle.</span> Not a listing.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed fade-up" style={{ animationDelay: '160ms' }}>
              MoveMatch AI is the first real estate platform that ranks neighborhoods by <em className="text-white/90 not-italic font-medium">lifestyle compatibility</em>. Describe how you want to live — we'll find where.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 fade-up" style={{ animationDelay: '260ms' }}>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button className="rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-cyan-500 hover:opacity-90 text-white text-base font-medium px-6 h-12 gap-2 shadow-lg shadow-fuchsia-500/30">
                    <Sparkles className="w-4 h-4" /> Find my lifestyle match
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/discover">
                  <Button className="rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-cyan-500 hover:opacity-90 text-white text-base font-medium px-6 h-12 gap-2 shadow-lg shadow-fuchsia-500/30">
                    <Sparkles className="w-4 h-4" /> Open the matcher
                  </Button>
                </Link>
              </SignedIn>
              <a href="#how">
                <Button variant="outline" className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-base h-12 px-6 gap-2">
                  <Play className="w-3.5 h-3.5" /> Watch demo
                </Button>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-white/45 fade-up" style={{ animationDelay: '360ms' }}>
              <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> 60+ countries</div>
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 12k+ users</div>
              <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> 4.9 / 5</div>
              <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-300" /> Free to start</div>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ============ LOGO STRIP ============ */}
      <section className="px-4 sm:px-8 py-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-white/30 mb-5">As featured in</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {LOGOS.map(l => (
              <span key={l} className="text-white/30 font-semibold tracking-tight text-base sm:text-lg hover:text-white/70 transition">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="px-4 sm:px-8 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-widest text-fuchsia-300/80 mb-3">How it works</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Three steps to your <span className="gradient-text">dream life</span>.</h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto">No filters. No bedroom counts. Just lifestyle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="gradient-border rounded-3xl p-8 relative overflow-hidden group fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-7xl font-bold gradient-text opacity-80 mb-4">{s.n}</div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-12 -right-4 w-8 h-8 text-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PROPERTIES ============ */}
      <section id="properties" className="px-4 sm:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-cyan-300/80 mb-3">Featured neighborhoods</div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Hand-picked by our AI.</h2>
              <p className="text-white/50 mt-2 max-w-xl">Real matches from real user prompts this week.</p>
            </div>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button variant="outline" className="rounded-full border-white/15 bg-white/5 hover:bg-white/10">
                  See all matches <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/discover">
                <Button variant="outline" className="rounded-full border-white/15 bg-white/5 hover:bg-white/10">
                  See all matches <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </SignedIn>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROPERTIES.map((p, i) => (
              <div key={i} className="group gradient-border rounded-2xl overflow-hidden fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="relative h-64 overflow-hidden">
                  <img src={p.img} alt={p.city} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 glass rounded-full px-2.5 py-1 text-[11px]">{p.vibe}</div>
                  <div className="absolute top-3 right-3 glass rounded-full p-2">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] text-white/70 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {p.country}
                      </div>
                      <div className="text-xl font-bold">{p.city}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-white/60">Match</div>
                      <div className="text-2xl font-bold gradient-text">{p.match}%</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40">Est. monthly</div>
                    <div className="text-lg font-semibold">${p.price.toLocaleString()}</div>
                  </div>
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <Button size="sm" className="rounded-full bg-white text-black hover:bg-white/90">
                        <Play className="w-3 h-3 mr-1.5 fill-black" /> Preview
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/discover">
                      <Button size="sm" className="rounded-full bg-white text-black hover:bg-white/90">
                        <Play className="w-3 h-3 mr-1.5 fill-black" /> Preview
                      </Button>
                    </Link>
                  </SignedIn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="px-4 sm:px-8 py-24 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-widest text-fuchsia-300/80 mb-3">What's inside</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto">Built like a luxury concierge. Priced like a tool.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="gradient-border rounded-2xl p-6 hover:bg-white/[0.03] transition fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="testimonials" className="px-4 sm:px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-widest text-cyan-300/80 mb-3">Loved by movers worldwide</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Real people. Real moves.</h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-300 text-amber-300" />)}
              <span className="text-sm text-white/60 ml-2">4.9 from 2,400+ users</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="gradient-border rounded-3xl p-7 fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />)}
                </div>
                <p className="text-base text-white/85 leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10" />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-white/50">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="px-4 sm:px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-widest text-fuchsia-300/80 mb-3">Pricing</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Free forever. Pro when you're serious.</h2>
            <p className="text-white/50 mt-3">Cancel anytime. No surprises.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {/* Free */}
            <div className="gradient-border rounded-3xl p-7 fade-up">
              <div className="text-xs uppercase tracking-widest text-white/50 mb-3">Free</div>
              <div className="text-4xl font-bold mb-1">$0</div>
              <div className="text-xs text-white/40 mb-6">forever</div>
              <ul className="space-y-2.5 text-sm mb-7">
                {['5 AI matches per month', 'Day-in-the-life previews', 'Save up to 10 destinations', 'Trending discovery', 'Mobile + desktop'].map(b => (
                  <li key={b} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /><span className="text-white/80">{b}</span></li>
                ))}
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button variant="outline" className="w-full border-white/15 bg-white/5 hover:bg-white/10 rounded-full">Get started</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/discover"><Button variant="outline" className="w-full border-white/15 bg-white/5 hover:bg-white/10 rounded-full">Open app</Button></Link>
              </SignedIn>
            </div>
            {/* Pro */}
            <div className="relative rounded-3xl p-7 fade-up overflow-hidden bg-gradient-to-br from-fuchsia-600/20 via-pink-500/10 to-cyan-500/20 border border-fuchsia-400/30" style={{ animationDelay: '80ms' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500">Most popular</div>
              <div className="text-xs uppercase tracking-widest text-fuchsia-200 mb-3">Pro</div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-sm text-white/60">/month</span>
              </div>
              <div className="text-xs text-white/50 mb-6">or $190/year (save 17%)</div>
              <ul className="space-y-2.5 text-sm mb-7">
                {['Unlimited AI matches', 'Floating AI concierge (GPT-5)', 'Budget planner + cost projections', 'Relocation roadmap', 'Save unlimited destinations', 'Compare cities side-by-side', 'Priority response time'].map(b => (
                  <li key={b} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /><span className="text-white/85">{b}</span></li>
                ))}
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button className="w-full rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 hover:opacity-90 font-medium shadow-lg shadow-fuchsia-500/30">
                    Start 7-day free trial
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button className="w-full rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 hover:opacity-90 font-medium shadow-lg shadow-fuchsia-500/30">
                  Upgrade to Pro
                </Button>
              </SignedIn>
            </div>
            {/* Founder */}
            <div className="gradient-border rounded-3xl p-7 fade-up" style={{ animationDelay: '160ms' }}>
              <div className="text-xs uppercase tracking-widest text-white/50 mb-3 flex items-center gap-2">Founder <Trophy className="w-3 h-3 text-amber-300" /></div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold">$290</span>
                <span className="text-sm text-white/60">once</span>
              </div>
              <div className="text-xs text-white/50 mb-6">Lifetime access · 100 spots left</div>
              <ul className="space-y-2.5 text-sm mb-7">
                {['Everything in Pro forever', 'Founder badge in community', 'Early access to new features', 'Direct line to founders', 'AI relocation specialist (1 hr)', 'Custom city deep-dives'].map(b => (
                  <li key={b} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /><span className="text-white/85">{b}</span></li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10 text-amber-200 rounded-full">
                Become a founder
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="px-4 sm:px-8 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-cyan-300/80 mb-3">Frequently asked</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Got questions?</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="gradient-border rounded-2xl px-5 border-0">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/65 text-sm leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="px-4 sm:px-8 py-24">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[2rem] p-12 sm:p-16 text-center bg-gradient-to-br from-fuchsia-600/20 via-pink-500/10 to-cyan-500/20 border border-white/10">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] bg-fuchsia-500/20" />
          </div>
          <Sparkles className="w-8 h-8 mx-auto text-fuchsia-300 mb-4" />
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight">Where will <span className="gradient-text">you</span> wake up tomorrow?</h2>
          <p className="text-white/65 mt-5 text-lg max-w-xl mx-auto">12,400 dreamers have already found their next home with MoveMatch AI. Free to start. Magic from minute one.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button className="rounded-full bg-white text-black hover:bg-white/90 text-base font-medium px-7 h-12 gap-2">
                  <Sparkles className="w-4 h-4" /> Get started free
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 h-12 px-7">
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/discover">
                <Button className="rounded-full bg-white text-black hover:bg-white/90 text-base font-medium px-7 h-12 gap-2">
                  <Sparkles className="w-4 h-4" /> Open the matcher
                </Button>
              </Link>
            </SignedIn>
          </div>
          <div className="mt-6 text-xs text-white/40">No credit card · Free forever plan · Cancel anytime</div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="px-4 sm:px-8 py-14 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-cyan-500 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-white" />
                </span>
                <span className="text-lg font-bold">MoveMatch <span className="gradient-text">AI</span></span>
              </div>
              <p className="text-sm text-white/45 leading-relaxed max-w-xs">
                The AI-powered real estate platform that matches you to neighborhoods by lifestyle, not filters.
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/40 mb-3">Product</div>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how" className="hover:text-white">How it works</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link href="/discover" className="hover:text-white">Discover</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/40 mb-3">Company</div>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a className="hover:text-white" href="#">About</a></li>
                <li><a className="hover:text-white" href="#">Careers</a></li>
                <li><a className="hover:text-white" href="#">Blog</a></li>
                <li><a className="hover:text-white" href="#">Press</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/40 mb-3">Legal</div>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a className="hover:text-white" href="#">Privacy</a></li>
                <li><a className="hover:text-white" href="#">Terms</a></li>
                <li><a className="hover:text-white" href="#">Cookies</a></li>
                <li><a className="hover:text-white" href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-7 border-t border-white/5 text-xs text-white/35">
            <div>© {new Date().getFullYear()} MoveMatch AI · Powered by GPT-5</div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All systems operational</span>
              <span>Made with ❤️ for movers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
