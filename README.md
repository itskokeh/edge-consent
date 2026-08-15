# @kokeh/edge-consent

A zero-dependency, ultra-lightweight, functional healthcare consent evaluation engine. Fully optimized for edge runtimes (Cloudflare Workers, Deno, Bun, LNode) plus (Node.js) and designed for high-performance API layers.

## Features

- ⚡ **Edge Native:** Zero external dependencies. Runs seamlessly at the edge.
- 🌳 **Fully Tree-Shakable:** Pure functional design ensures you only bundle what you use.
- 🏥 **Healthcare Ready:** Built-in structures to filter data by actors, purposes, and sensitive clinical exceptions.
- 🛡️ **Type-Safe:** Native TypeScript design schemas.

## Installation

Install via JSR using your preferred package manager:

```bash
# Using pnpm
pnpm dlx jsr add @kokeh/edge-consent

# Using npm
npx jsr add @kokeh/edge-consent

# Using bun
bunx jsr add @kokeh/edge-consent
```

## Quick Start

Integrate the pure validation functions directly into your backend routing layer (e.g., Hono, Express, Nestjs):

```typescript
import { Hono } from 'hono'
import { evaluateConsent, type ConsentPolicy } from '@kokeh/edge-consent'

const app = new Hono()

app.post('/api/v1/medical-records/access', async (c) => {
  const { actorId, purpose, dataCategory, patientId } = await c.req.json()

  // 1. Fetch the raw consent policy document from your database
  const record = await db.from('consents').where({ patientId }).first()
  
  const consentPolicy = {
    id: record.id,
    patientId: record.patient_id,
    status: record.status, // 'active' | 'inactive' | 'revoked'
    expiresAt: record.expires_at,
    allowedActors: record.allowed_actors, // e.g., ['dr-smith', 'clinic-east']
    allowedPurposes: record.allowed_purposes, // e.g., ['TREATMENT', 'RESEARCH']
    exceptedCategories: record.excepted_categories // e.g., ['mental-health']
  } satisfies ConsentPolicy

  // 2. Evaluate access safely via pure functions
  const decision = evaluateConsent(consentPolicy, { actorId, purpose, dataCategory })

  // 3. Block unauthorized entry strictly
  if (!decision.allowed) {
    return c.json({ 
      authorized: false, 
      error: decision.reason // e.g., 'CATEGORY_EXCEPTED' or 'ACTOR_NOT_PERMITTED'
    }, 403)
  }

  // 4. Return secure patient data safely
  return c.json({ authorized: true, data: "..." })
})
```

## API Reference

### `evaluateConsent(consent, request)`

Takes a `ConsentPolicy` policy and an `AccessRequest` object, returning a structured status object.

**Returns:**

```typescript
{
  allowed: boolean;
  reason: 'PERMITTED' | 'POLICY_INACTIVE' | 'POLICY_EXPIRED' | 'ACTOR_NOT_PERMITTED' | 'PURPOSE_NOT_PERMITTED' | 'CATEGORY_EXCEPTED';
}
```

### `isConsentExpired(consentDate)`

Helper utility returning a strict boolean check against the `expiresAt` ISO timestamp boundary.

## License

MIT
