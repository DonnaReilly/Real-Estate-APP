import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/match',
  '/api/chat',
  '/api/day-in-life',
])

const isApiRoute = createRouteMatcher(['/api/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return

  const { userId, redirectToSignIn } = await auth()

  if (!userId) {
    if (isApiRoute(req)) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return redirectToSignIn({ returnBackUrl: req.url })
  }
})

export const config = {
  matcher: ['/((?!_next|.+\\.[\\w]+$).*)', '/', '/(api|trpc)(.*)'],
}
