import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export const metadata = {
  title: 'MoveMatch AI — Find your dream lifestyle',
  description: 'AI-powered real estate discovery. Describe your dream lifestyle and let AI match you with the perfect neighborhood.',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#d946ef',
          colorBackground: '#0a0a0c',
          colorInputBackground: '#1a1a1d',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#a1a1aa',
          borderRadius: '0.75rem',
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          card: 'bg-zinc-950/80 backdrop-blur-2xl border border-white/10',
          headerTitle: 'text-white',
          headerSubtitle: 'text-zinc-400',
          socialButtonsBlockButton: 'border-white/10 hover:bg-white/5',
          formButtonPrimary: 'bg-gradient-to-br from-fuchsia-500 to-cyan-500 hover:opacity-90',
        },
      }}
    >
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
        </head>
        <body className="min-h-screen antialiased bg-[#08080b] text-white selection:bg-fuchsia-500/30">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
