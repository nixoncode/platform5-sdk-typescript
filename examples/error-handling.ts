import {
  Platform5,
  InsufficientBalanceError,
  Platform5Error,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "../src/index.js"

async function main() {
  const app = Platform5({ apiKey: "p5_live_abc123def456" })

  try {
    await app.sms.send({ to: "+254712345678", message: "Hello", from: "MyBrand" })
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      console.error("Invalid or missing API key")
    } else if (err instanceof InsufficientBalanceError) {
      console.error("Top up your account — not enough balance")
    } else if (err instanceof ValidationError) {
      console.error("Validation failed:", err.errors)
    } else if (err instanceof RateLimitError) {
      console.error(`Rate limited: ${err.limit} req/s, ${err.remaining} remaining`)
    } else if (err instanceof Platform5Error) {
      console.error(`API error ${err.status}: ${err.message}`)
    } else {
      console.error("Network error:", err)
    }
  }
}

main()
