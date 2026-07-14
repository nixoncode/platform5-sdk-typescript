# @platform5/sdk

TypeScript SDK for the Platform5 Developer API.

## Install

```sh
npm install @platform5/sdk
```

## Usage

```typescript
import { Platform5 } from "@platform5/sdk"

const app = Platform5({
  apiKey: "p5_live_abc123def456",
  baseUrl: "https://api.platform5.tech",
})

// Send an SMS
const sms = await app.sms.send({
  to: "+254712345678",
  message: "Your appointment is confirmed for tomorrow at 10 AM.",
  from: "MyBrand",
})
console.log(sms.message_id, sms.parts, sms.cost)

// Send an email
const email = await app.email.send({
  to: "user@example.com",
  subject: "Welcome to Platform5",
  body: "Hello, thank you for signing up!",
  from: "MyBrand",
})

// Check message status
const status = await app.messages.get("msg-uuid-here")

// Check balance
const balance = await app.account.getBalance()
```

## Configuration

```typescript
Platform5({
  apiKey: "p5_live_abc123def456", // required: your API key
  baseUrl: "http://localhost:8084", // optional: defaults to http://localhost:8084
})
```

## API

### `app.sms`

| Method             | Description         |
| ------------------ | ------------------- |
| `send(req, opts?)` | Send an SMS message |

#### SendSMSRequest

| Field     | Type     | Description                                   |
| --------- | -------- | --------------------------------------------- |
| `to`      | `string` | Recipient phone number (E.164 format)         |
| `message` | `string` | Message content (up to ~1600 characters)      |
| `from`    | `string` | Verified Sender ID / alphanumeric sender name |

#### RequestOptions

| Field            | Type          | Description                                             |
| ---------------- | ------------- | ------------------------------------------------------- |
| `idempotencyKey` | `string`      | Custom idempotency key (auto-generated UUID by default) |
| `signal`         | `AbortSignal` | Optional AbortSignal for request cancellation           |

### `app.email`

| Method             | Description   |
| ------------------ | ------------- |
| `send(req, opts?)` | Send an email |

#### SendEmailRequest

| Field       | Type               | Required | Description                      |
| ----------- | ------------------ | -------- | -------------------------------- |
| `to`        | `string`           | yes      | Recipient email address          |
| `subject`   | `string`           | yes      | Email subject line               |
| `body`      | `string`           | yes      | Email body content               |
| `body_type` | `"text" \| "html"` | no       | Content type (default: `"text"`) |
| `from`      | `string`           | yes      | Verified sender name             |

### `app.messages`

| Method    | Description                      |
| --------- | -------------------------------- |
| `get(id)` | Get delivery status of a message |

### `app.account`

| Method         | Description                               |
| -------------- | ----------------------------------------- |
| `getBalance()` | Get available and current account balance |

### `app.health()`

Check if the API is reachable. Throws on failure, returns `void` on success.

## Error Handling

Every non-2xx response throws a typed error:

```typescript
import {
  UnauthorizedError,
  InsufficientBalanceError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  Platform5Error,
} from "@platform5/sdk"

try {
  await app.sms.send({ to: "+254712345678", message: "Hello", from: "MyBrand" })
} catch (err) {
  if (err instanceof RateLimitError) {
    console.error(`Rate limited: ${err.limit} req/s, ${err.remaining} remaining`)
  } else if (err instanceof Platform5Error) {
    console.error(`API error ${err.status}: ${err.message}`)
  }
}
```

| Error                      | Status | When                                                 |
| -------------------------- | ------ | ---------------------------------------------------- |
| `UnauthorizedError`        | 401    | Missing or invalid API key                           |
| `InsufficientBalanceError` | 402    | Not enough balance                                   |
| `ForbiddenError`           | 403    | Key lacks required scope                             |
| `NotFoundError`            | 404    | Message ID not found                                 |
| `ValidationError`          | 422    | Invalid request data                                 |
| `RateLimitError`           | 429    | Too many requests (includes `limit` and `remaining`) |
| `Platform5Error`           | any    | Catch-all for other non-2xx responses                |

Network errors (connection refused, DNS failure, timeout) are thrown as `Platform5Error` with status `0`.

## Idempotency

`sms.send()` and `email.send()` automatically generate an `Idempotency-Key` header (UUID v4) for every request. This prevents duplicate charges on retry. Provide a custom key via `opts.idempotencyKey` if needed.

## Retry Pattern

```typescript
import { Platform5, Platform5Error } from "@platform5/sdk"

async function sendWithRetry(to: string, message: string, from: string, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await app.sms.send({ to, message, from })
    } catch (err) {
      if (err instanceof Platform5Error && err.status >= 500) {
        if (attempt < retries) {
          const delay = Math.min(1000 * 2 ** attempt, 10000)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
      }
      throw err
    }
  }
}
```

## Requirements

- Node.js 18+ (native `fetch` support)
- TypeScript 5+ (for type definitions)

## Build

```sh
npm run build     # ESM + CJS
npm run typecheck # type-check only
npm run test      # run tests
```
