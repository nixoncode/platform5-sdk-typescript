import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { HttpClient, Platform5 } from "../client.js"
import {
  Platform5Error,
  UnauthorizedError,
  InsufficientBalanceError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
} from "../errors.js"

function mockFetch(status: number, body: unknown, headers?: Record<string, string>) {
  return vi.mocked(globalThis.fetch).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    headers: {
      get(name: string) {
        if (name === "X-Request-ID") return "req-123"
        if (name === "X-RateLimit-Limit") return headers?.["X-RateLimit-Limit"] ?? null
        if (name === "X-RateLimit-Remaining") return headers?.["X-RateLimit-Remaining"] ?? null
        return null
      },
    },
    json: () => Promise.resolve(body),
  } as Response)
}

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("HttpClient", () => {
  function createClient() {
    return new HttpClient({ apiKey: "test-key", baseUrl: "http://localhost:8084" })
  }

  describe("request", () => {
    it("sends GET request with correct headers", async () => {
      mockFetch(200, { success: true, message: "ok", data: null, errors: null })
      const client = createClient()

      await client.request("GET", "/health")

      expect(fetch).toHaveBeenCalledWith("http://localhost:8084/health", {
        method: "GET",
        headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
        body: undefined,
        signal: undefined,
      })
    })

    it("sends POST with JSON body and idempotency key", async () => {
      mockFetch(200, { success: true, message: "ok", data: null, errors: null })
      const client = createClient()

      await client.request("POST", "/v1/sms/send", { body: { to: "+2547" }, idempotencyKey: "idem-1" })

      expect(fetch).toHaveBeenCalledWith("http://localhost:8084/v1/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "test-key",
          "Idempotency-Key": "idem-1",
        },
        body: '{"to":"+2547"}',
        signal: undefined,
      })
    })

    it("returns the full envelope on success", async () => {
      mockFetch(200, { success: true, message: "ok", data: { balance: 100 }, errors: null })
      const client = createClient()

      const res = await client.request("GET", "/v1/balance")

      expect(res.data).toEqual({ balance: 100 })
    })

    it("throws UnauthorizedError on 401", async () => {
      mockFetch(401, { success: false, message: "Invalid key", errors: "bad_api_key", data: null })
      const client = createClient()

      await expect(client.request("GET", "/v1/balance")).rejects.toThrow(UnauthorizedError)
    })

    it("throws InsufficientBalanceError on 402", async () => {
      mockFetch(402, { success: false, message: "No funds", errors: null, data: null })
      const client = createClient()

      await expect(client.request("GET", "/v1/balance")).rejects.toThrow(InsufficientBalanceError)
    })

    it("throws ForbiddenError on 403", async () => {
      mockFetch(403, { success: false, message: "Forbidden", errors: "no scope", data: null })
      const client = createClient()

      await expect(client.request("GET", "/v1/balance")).rejects.toThrow(ForbiddenError)
    })

    it("throws NotFoundError on 404", async () => {
      mockFetch(404, { success: false, message: "Not found", errors: null, data: null })
      const client = createClient()

      await expect(client.request("GET", "/v1/notfound")).rejects.toThrow(NotFoundError)
    })

    it("throws ValidationError on 422", async () => {
      mockFetch(422, { success: false, message: "Validation failed", errors: "invalid from", data: null })
      const client = createClient()

      await expect(client.request("POST", "/v1/sms/send")).rejects.toThrow(ValidationError)
    })

    it("throws RateLimitError on 429 with headers", async () => {
      mockFetch(429, { success: false, message: "Rate limited", errors: "too_many_requests", data: null }, {
        "X-RateLimit-Limit": "50",
        "X-RateLimit-Remaining": "0",
      })
      const client = createClient()

      let err: RateLimitError | undefined
      try {
        await client.request("GET", "/v1/balance")
      } catch (e) {
        err = e as RateLimitError
      }

      expect(err).toBeInstanceOf(RateLimitError)
      expect(err!.limit).toBe(50)
      expect(err!.remaining).toBe(0)
    })

    it("throws Platform5Error on generic error status", async () => {
      mockFetch(500, { success: false, message: "Server error", errors: null, data: null })
      const client = createClient()

      await expect(client.request("GET", "/health")).rejects.toThrow(Platform5Error)
    })

    it("throws Platform5Error with status 0 on network failure", async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new TypeError("fetch failed"))
      const client = createClient()

      let err: Platform5Error | undefined
      try {
        await client.request("GET", "/health")
      } catch (e) {
        err = e as Platform5Error
      }

      expect(err).toBeInstanceOf(Platform5Error)
      expect(err!.status).toBe(0)
      expect(err!.message).toBe("fetch failed")
    })

    it("uses default baseUrl when not provided", () => {
      const client = new HttpClient({ apiKey: "k" })
      // The default is http://localhost:8084
      expect(client).toBeDefined()
    })
  })
})

describe("Platform5", () => {
  it("returns a Platform5Client with lazy service getters", () => {
    const app = Platform5({ apiKey: "test-key" })

    expect(typeof app.sms.send).toBe("function")
    expect(typeof app.email.send).toBe("function")
    expect(typeof app.messages.get).toBe("function")
    expect(typeof app.account.getBalance).toBe("function")
    expect(typeof app.health).toBe("function")
  })

  it("caches service instances", () => {
    const app = Platform5({ apiKey: "test-key" })
    expect(app.sms).toBe(app.sms)
    expect(app.email).toBe(app.email)
  })
})
