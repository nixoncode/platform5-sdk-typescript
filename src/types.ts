export interface Platform5Config {
  apiKey: string
  baseUrl?: string
}

export interface RequestOptions {
  idempotencyKey?: string
  signal?: AbortSignal
}

export interface APIResponse<T> {
  success: boolean
  message: string
  data: T
  errors: string | null
}

export interface SendSMSRequest {
  to: string
  message: string
  from: string
}

export interface SendSMSResponse {
  message_id: string
  to: string
  sender_name: string
  parts: number
  cost: number
  currency: string
  status: "queued"
}

export interface SendEmailRequest {
  to: string
  subject: string
  body: string
  body_type?: "text" | "html"
  from: string
}

export interface SendEmailResponse {
  message_id: string
  status: "queued"
}

export interface MessageStatusResponse {
  id: string
  to: string
  sender_name: string
  parts: number
  cost: number
  status: "queued" | "forwarded" | "sent" | "delivered" | "failed" | "rejected"
  created_at: string
  sent_at: string | null
  delivered_at: string | null
  error: string | null
}

export interface BalanceResponse {
  available_balance: number
  current_balance: number
  currency: string
}
