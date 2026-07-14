import type { HttpClient } from "../client.js"
import type { RequestOptions, SendEmailRequest, SendEmailResponse } from "../types.js"
import { generateUUID } from "../utils.js"

export class EmailService {
  constructor(private client: HttpClient) {}

  async send(req: SendEmailRequest, opts?: RequestOptions): Promise<SendEmailResponse> {
    const res = await this.client.request<SendEmailResponse>("POST", "/v1/email/send", {
      body: req,
      idempotencyKey: opts?.idempotencyKey ?? generateUUID(),
      signal: opts?.signal,
    })
    return res.data!
  }
}
