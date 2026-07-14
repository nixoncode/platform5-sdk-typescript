import type { HttpClient } from "../client.js"
import type { RequestOptions, SendSMSRequest, SendSMSResponse } from "../types.js"
import { generateUUID } from "../utils.js"

export class SmsService {
  constructor(private client: HttpClient) {}

  async send(req: SendSMSRequest, opts?: RequestOptions): Promise<SendSMSResponse> {
    const res = await this.client.request<SendSMSResponse>("POST", "/v1/sms/send", {
      body: req,
      idempotencyKey: opts?.idempotencyKey ?? generateUUID(),
      signal: opts?.signal,
    })
    return res.data!
  }
}
