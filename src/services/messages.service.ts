import type { HttpClient } from "../client.js"
import type { MessageStatusResponse } from "../types.js"

export class MessagesService {
  constructor(private client: HttpClient) {}

  async get(id: string): Promise<MessageStatusResponse> {
    const res = await this.client.request<MessageStatusResponse>("GET", `/v1/messages/${encodeURIComponent(id)}`)
    return res.data!
  }
}
