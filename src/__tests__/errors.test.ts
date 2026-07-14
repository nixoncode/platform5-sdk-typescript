import { describe, expect, it } from "vitest"
import {
  Platform5Error,
  UnauthorizedError,
  InsufficientBalanceError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
} from "../errors.js"

describe("Platform5Error", () => {
  it("stores status, message, errors, requestId", () => {
    const err = new Platform5Error(400, "bad request", "invalid_field", "req-123")
    expect(err.status).toBe(400)
    expect(err.message).toBe("bad request")
    expect(err.errors).toBe("invalid_field")
    expect(err.requestId).toBe("req-123")
    expect(err.name).toBe("Platform5Error")
  })
})

describe("UnauthorizedError", () => {
  it("extends Platform5Error with name set", () => {
    const err = new UnauthorizedError(401, "unauthorized", null, "r1")
    expect(err).toBeInstanceOf(Platform5Error)
    expect(err.name).toBe("UnauthorizedError")
    expect(err.status).toBe(401)
  })
})

describe("InsufficientBalanceError", () => {
  it("sets status 402", () => {
    const err = new InsufficientBalanceError(402, "no funds", null, "r1")
    expect(err.name).toBe("InsufficientBalanceError")
    expect(err.status).toBe(402)
  })
})

describe("ForbiddenError", () => {
  it("sets status 403", () => {
    const err = new ForbiddenError(403, "forbidden", "missing scope", "r1")
    expect(err.name).toBe("ForbiddenError")
    expect(err.status).toBe(403)
  })
})

describe("NotFoundError", () => {
  it("sets status 404", () => {
    const err = new NotFoundError(404, "not found", null, "r1")
    expect(err.name).toBe("NotFoundError")
    expect(err.status).toBe(404)
  })
})

describe("ValidationError", () => {
  it("sets status 422", () => {
    const err = new ValidationError(422, "validation failed", "invalid from", "r1")
    expect(err.name).toBe("ValidationError")
    expect(err.status).toBe(422)
  })
})

describe("RateLimitError", () => {
  it("stores limit and remaining", () => {
    const err = new RateLimitError(429, "too many requests", null, "r1", 50, 12)
    expect(err.name).toBe("RateLimitError")
    expect(err.status).toBe(429)
    expect(err.limit).toBe(50)
    expect(err.remaining).toBe(12)
  })
})
