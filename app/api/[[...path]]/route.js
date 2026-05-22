import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// MongoDB connection (lazy)
let client
let db
async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

const LLM_URL = (process.env.LLM_BASE_URL || 'https://integrations.emergentagent.com/llm') + '/chat/completions'
const LLM_KEY = process.env.EMERGENT_LLM_KEY

const CURATED_IMAGES = [
  'https://images.unsplash.com/photo-1748063578185-3d68121b11ff',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
  'https://images.unsplash.com/photo-1531819177115-428566ccfb50',
  'https://images.unsplash.com/photo-1514939775307-d44e7f10cabd',
  'https://images.unsplash.com/photo-1633149668746-2891c0ff7334',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
  'https://images.pexels.com/photos/18912997/pexels-photo-18912997.jpeg',
  'https://images.unsplash.com/photo-1610123172705-a57f116cd4d9',
  'https://images.unsplash.com/photo-1633250307378-5604b26a164b',
  'https://images.unsplash.com/photo-1774803681248-dc3cac13f018',
  'https://images.unsplash.com/photo-1749063240044-82d7db59879d',
  'https://images.unsplash.com/photo-1607570799395-b968ad047e3f',
]

function pickImage(seed) {
  if (typeof seed !== 'string') seed = String(seed || Math.random())
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return CURATED_IMAGES[Math.abs(h) % CURATED_IMAGES.length] + '?auto=format&fit=crop&w=1200&q=80'
}

async function callLLM({ messages, jsonMode = false, temperature = 0.7, model = 'gpt-5-mini', reasoningEffort = 'low' }) {
  if (!LLM_KEY) throw new Error('Missing EMERGENT_LLM_KEY')
  const body = { model, messages }
  if (jsonMode) body.response_format = { type: 'json_object' }
  // gpt-5 only supports default temperature (1). Skip temperature for gpt-5.
  if (!model.startsWith('gpt-5')) body.temperature = temperature
  if (model.startsWith('gpt-5') && reasoningEffort) body.reasoning_effort = reasoningEffort

  const res = await fetch(LLM_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LLM_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LLM error ${res.status}: ${text}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // ============ ROOT ============
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'MoveMatch AI API live' }))
    }

    // ============ AI MATCH ============
    if (route === '/match' && method === 'POST') {
      const body = await request.json()
      const prompt = (body.prompt || '').toString().trim()
      if (!prompt) {
        return handleCORS(NextResponse.json({ error: 'prompt required' }, { status: 400 }))
      }

      const systemMsg = `You are MoveMatch AI, an elite real-estate + lifestyle matchmaker.
The user describes their dream lifestyle in natural language. You generate 6 perfectly matched neighborhoods around the world.
Return ONLY a valid JSON object with this exact schema (no markdown, no commentary):
{
  "summary": "1-2 sentence interpretation of the user's lifestyle in beautiful prose",
  "neighborhoods": [
    {
      "name": "Neighborhood name",
      "city": "City",
      "country": "Country",
      "emoji": "single representative emoji",
      "matchPercent": 78-99 integer,
      "vibe": "2-4 word vibe label e.g. 'Beach + Slow Mornings'",
      "tagline": "punchy 6-10 word tagline",
      "summary": "2 sentence lifestyle summary, evocative and cinematic",
      "monthlyCost": estimated monthly living cost in USD as integer 800-12000,
      "scores": {
         "vibe": 0-100 integer,
         "safety": 0-100,
         "walkability": 0-100,
         "social": 0-100,
         "remoteWork": 0-100,
         "wellness": 0-100,
         "costFriendly": 0-100
      },
      "hotspots": ["3-5 short names of nearby cafes/landmarks/spots"],
      "tags": ["3-5 short lifestyle tags e.g. 'digital nomad','surf','vegan'"],
      "weatherMood": "1-3 word weather mood e.g. 'Sunny & breezy'",
      "hiddenGem": "1 sentence hidden-gem secret about this place"
    }
  ]
}
Be globally diverse, mix famous + lesser-known places. Match each neighborhood deeply to the user's prompt.`

      const userMsg = `User dream lifestyle: """${prompt}"""\n\nReturn JSON only.`

      let parsed
      try {
        const raw = await callLLM({
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: userMsg },
          ],
          jsonMode: true,
          model: 'gpt-5-mini',
        })
        parsed = JSON.parse(raw)
      } catch (err) {
        console.error('match LLM err', err)
        return handleCORS(NextResponse.json({ error: 'AI matching failed', detail: String(err.message || err) }, { status: 502 }))
      }

      // attach IDs + images (unique per result via index-based assignment)
      const shuffled = [...CURATED_IMAGES].sort(() => Math.random() - 0.5)
      const neighborhoods = (parsed.neighborhoods || []).map((n, idx) => ({
        id: uuidv4(),
        image: (shuffled[idx % shuffled.length] || CURATED_IMAGES[0]) + '?auto=format&fit=crop&w=1200&q=80',
        ...n,
      }))

      // persist in mongo (fire and forget)
      try {
        const dbi = await connectToMongo()
        await dbi.collection('matches').insertOne({
          id: uuidv4(),
          prompt,
          summary: parsed.summary,
          neighborhoods,
          createdAt: new Date(),
        })
      } catch (e) { console.error('mongo insert', e) }

      return handleCORS(NextResponse.json({
        summary: parsed.summary || '',
        neighborhoods,
      }))
    }

    // ============ DAY IN LIFE ============
    if (route === '/day-in-life' && method === 'POST') {
      const body = await request.json()
      const { neighborhood, prompt = '' } = body
      if (!neighborhood) return handleCORS(NextResponse.json({ error: 'neighborhood required' }, { status: 400 }))

      const sys = `You are a luxury travel + lifestyle writer. Craft an immersive, cinematic "Day in the Life" preview for the given neighborhood matched to the user's lifestyle. Use vivid sensory language. 4 short paragraphs labelled Morning, Midday, Afternoon, Evening. Each paragraph 2-3 sentences. Return JSON: { "morning": str, "midday": str, "afternoon": str, "evening": str, "soundtrack": "song title - artist that captures the vibe" }`
      const usr = `Neighborhood: ${neighborhood.name}, ${neighborhood.city}, ${neighborhood.country}\nVibe: ${neighborhood.vibe}\nTags: ${(neighborhood.tags || []).join(', ')}\nUser lifestyle: ${prompt}\n\nReturn JSON only.`

      try {
        const raw = await callLLM({
          messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }],
          jsonMode: true,
          model: 'gpt-5-mini',
        })
        const parsed = JSON.parse(raw)
        return handleCORS(NextResponse.json(parsed))
      } catch (e) {
        return handleCORS(NextResponse.json({ error: 'failed', detail: String(e.message || e) }, { status: 502 }))
      }
    }

    // ============ CHAT ASSISTANT ============
    if (route === '/chat' && method === 'POST') {
      const body = await request.json()
      const { history = [], message, sessionId } = body
      if (!message) return handleCORS(NextResponse.json({ error: 'message required' }, { status: 400 }))

      const sys = {
        role: 'system',
        content: `You are MoveMatch AI's helpful concierge. You give short, smart, friendly answers about cities, neighborhoods, cost of living, relocation, and lifestyle fit. Keep replies under 120 words unless asked for more. Use natural human tone. If user asks for recommendations, give 2-3 vivid options with one-liner reasons.`,
      }
      const msgs = [sys, ...history.slice(-10), { role: 'user', content: message }]

      try {
        const reply = await callLLM({ messages: msgs, model: 'gpt-5-mini' })
        // persist
        try {
          const dbi = await connectToMongo()
          await dbi.collection('chats').insertOne({
            id: uuidv4(),
            sessionId: sessionId || 'anon',
            message,
            reply,
            at: new Date(),
          })
        } catch (e) {}
        return handleCORS(NextResponse.json({ reply }))
      } catch (e) {
        return handleCORS(NextResponse.json({ error: 'chat failed', detail: String(e.message || e) }, { status: 502 }))
      }
    }

    // ============ SAVE / UNSAVE (Clerk-auth) ============
    if (route === '/save' && method === 'POST') {
      const { userId } = await auth()
      if (!userId) return handleCORS(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const body = await request.json()
      const neighborhood = body.neighborhood || body
      if (!neighborhood?.id) return handleCORS(NextResponse.json({ error: 'neighborhood required' }, { status: 400 }))
      try {
        const dbi = await connectToMongo()
        const existing = await dbi.collection('saves').findOne({ userId, 'neighborhood.id': neighborhood.id })
        if (existing) {
          await dbi.collection('saves').deleteOne({ _id: existing._id })
          return handleCORS(NextResponse.json({ ok: true, saved: false }))
        }
        await dbi.collection('saves').insertOne({
          id: uuidv4(),
          userId,
          neighborhood,
          at: new Date(),
        })
        return handleCORS(NextResponse.json({ ok: true, saved: true }))
      } catch (e) {
        console.error('save err', e)
        return handleCORS(NextResponse.json({ error: 'save failed' }, { status: 500 }))
      }
    }

    if (route === '/saves' && method === 'GET') {
      const { userId } = await auth()
      if (!userId) return handleCORS(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      try {
        const dbi = await connectToMongo()
        const docs = await dbi.collection('saves').find({ userId }).sort({ at: -1 }).limit(200).toArray()
        const items = docs.map(({ _id, ...r }) => r.neighborhood).filter(Boolean)
        return handleCORS(NextResponse.json({ items }))
      } catch (e) {
        return handleCORS(NextResponse.json({ items: [] }))
      }
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error', detail: String(error.message || error) }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
