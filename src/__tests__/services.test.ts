import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { HttpClient } from "../client.js"
import { SmsService } from "../services/sms.service.js"
import { EmailService } from "../services/email.service.js"
import { MessagesService } from "../services/messages.service.js"
import { AccountService } from "../services/account.service.js"

function mockFetch(status: number, body: unknown) {
  return vi.mocked(globalThis.fetch).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    headers: { get: () => null },
    json: () => Promise.resolve(body),
    } as unknown as Response)
}

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function createHttp() {
  return new HttpClient({ apiKey: "test-key", baseUrl: "http://localhost:8084" })
}

describe("SmsService", () => {
  it("send calls POST /v1/sms/send and returns unwrapped data", async () => {
    mockFetch(200, {
      success: true,
      message: "SMS queued",
      data: { message_id: "m1", to: "+2547", sender_name: "MyBrand", parts: 1, cost: 1.0, currency: "KES", status: "queued" },
      errors: null,
    })

    const svc = new SmsService(createHttp())
    const result = await svc.send({ to: "+2547", message: "Hello", from: "MyBrand" })

    expect(result.message_id).toBe("m1")
    expect(result.status).toBe("queued")
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe("EmailService", () => {
  it("send calls POST /v1/email/send and returns unwrapped data", async () => {
    mockFetch(200, {
      success: true,
      message: "Email queued",
      data: { message_id: "e1", status: "queued" },
      errors: null,
    })

    const svc = new EmailService(createHttp())
    const result = await svc.send({ to: "a@b.com", subject: "Hi", body: "Hello", from: "MyBrand" })

    expect(result.message_id).toBe("e1")
  })
})

describe("MessagesService", () => {
  it("get calls GET /v1/messages/{id} and returns unwrapped data", async () => {
    mockFetch(200, {
      success: true,
      message: "Message retrieved",
      data: { id: "m1", to: "+2547", sender_name: "MyBrand", parts: 1, cost: 1.0, status: "delivered", created_at: "2024-01-01T00:00:00Z", sent_at: null, delivered_at: null, error: null },
      errors: null,
    })

    const svc = new MessagesService(createHttp())
    const result = await svc.get("m1")

    expect(result.id).toBe("m1")
    expect(result.status).toBe("delivered")
  })
})

describe("AccountService", () => {
  it("getBalance calls GET /v1/balance and returns unwrapped data", async () => {
    mockFetch(200, {
      success: true,
      message: "Balance retrieved",
      data: { available_balance: 100, current_balance: 200, currency: "KES" },
      errors: null,
    })

    const svc = new AccountService(createHttp())
    const result = await svc.getBalance()

    expect(result.available_balance).toBe(100)
    expect(result.currency).toBe("KES")
  })
})
