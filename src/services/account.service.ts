import type { HttpClient } from "../client.js"
import type { BalanceResponse } from "../types.js"

export class AccountService {
  constructor(private client: HttpClient) {}

  async getBalance(): Promise<BalanceResponse> {
    const res = await this.client.request<BalanceResponse>("GET", "/v1/balance")
    return res.data!
  }
}
