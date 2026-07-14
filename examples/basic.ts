import { Platform5 } from "../src/index.js"

async function main() {
  const app = Platform5({
    apiKey: "p5_live_abc123def456",
    baseUrl: "http://localhost:8084",
  })

  // Health check
  await app.health()

  // Send an SMS
  const sms = await app.sms.send({
    to: "+254712345678",
    message: "Your appointment is confirmed for tomorrow at 10 AM.",
    from: "MyBrand",
  })
  console.log(sms.message_id, sms.parts, sms.cost)

  // Send with custom idempotency key
  await app.sms.send(
    { to: "+254712345678", message: "Reminder: Meeting at 2 PM", from: "MyBrand" },
    { idempotencyKey: "550e8400-e29b-41d4-a716-446655440000" },
  )

  // Send an email
  const email = await app.email.send({
    to: "user@example.com",
    subject: "Welcome to Platform5",
    body: "<h1>Hello!</h1><p>Thank you for signing up.</p>",
    body_type: "html",
    from: "MyBrand",
  })
  console.log(email.message_id)

  // Send plain text email
  await app.email.send({
    to: "user@example.com",
    subject: "Welcome",
    body: "Hello, thank you for signing up!",
    from: "MyBrand",
  })

  // Check message delivery status
  const status = await app.messages.get("550e8400-e29b-41d4-a716-446655440000")
  console.log(status.status, status.parts, status.cost)

  // Check account balance
  const balance = await app.account.getBalance()
  console.log(balance.available_balance, balance.currency)
}

main()
