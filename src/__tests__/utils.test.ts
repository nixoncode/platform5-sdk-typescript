import { describe, expect, it } from "vitest"
import { generateUUID } from "../utils.js"

describe("generateUUID", () => {
  it("returns a string in UUID v7 format", () => {
    const uuid = generateUUID()
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it("returns unique values on successive calls", () => {
    const a = generateUUID()
    const b = generateUUID()
    expect(a).not.toBe(b)
  })
})
