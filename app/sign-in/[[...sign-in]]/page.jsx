import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-[120px] bg-fuchsia-600/40" />
        <div className="absolute top-1/2 -right-40 w-[480px] h-[480px] rounded-full blur-[120px] bg-cyan-500/30" />
      </div>
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center group">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
            <Compass className="w-5 h-5 text-white" />
          </span>
          <span className="text-xl font-bold tracking-tight">MoveMatch <span className="gradient-text">AI</span></span>
        </Link>
        <SignIn />
      </div>
    </div>
  )
}
