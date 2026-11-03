import type { HttpClient } from "../client.js"
import type { BuyAirtimeRequest, BuyAirtimeResponse, RequestOptions } from "../types.js"
import { generateUUID } from "../utils.js"

export class AirtimeService {
  constructor(private client: HttpClient) {}

  async buy(req: BuyAirtimeRequest, opts?: RequestOptions): Promise<BuyAirtimeResponse> {
    const res = await this.client.request<BuyAirtimeResponse>("POST", "/v1/airtime/buy", {
      body: req,
      idempotencyKey: opts?.idempotencyKey ?? generateUUID(),
      signal: opts?.signal,
    })
    return res.data!
  }
}
