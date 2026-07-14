import { Platform5, Platform5Error } from "../src/index.js"

async function main() {
  const app = Platform5({ apiKey: "p5_live_abc123def456" })

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
    throw new Error("All retries exhausted")
  }

  const result = await sendWithRetry("+254712345678", "Hello after retry", "MyBrand")
  console.log("Sent:", result.message_id)
}

main()
