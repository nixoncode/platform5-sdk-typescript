import type { APIResponse, Platform5Config } from "./types.js"
import {
  ForbiddenError,
  InsufficientBalanceError,
  NotFoundError,
  Platform5Error,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "./errors.js"
import { SmsService } from "./services/sms.service.js"
import { EmailService } from "./services/email.service.js"
import { MessagesService } from "./services/messages.service.js"
import { AccountService } from "./services/account.service.js"

const DEFAULT_BASE_URL = "http://localhost:8084"

export class HttpClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: Platform5Config) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
  }

  async request<T>(
    method: string,
    path: string,
    options?: { body?: unknown; idempotencyKey?: string; signal?: AbortSignal },
  ): Promise<APIResponse<T>> {
    const url = new URL(path, this.baseUrl)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
    }

    if (options?.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey
    }

    let response: Response
    try {
      response = await fetch(url.toString(), {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: options?.signal,
      })
    } catch (err) {
      throw new Platform5Error(0, (err as Error).message, null, null)
    }

    const requestId = response.headers.get("X-Request-ID")
    const limitHeader = response.headers.get("X-RateLimit-Limit")
    const remainingHeader = response.headers.get("X-RateLimit-Remaining")
    const rateLimit =
      limitHeader
        ? { limit: parseInt(limitHeader, 10), remaining: parseInt(remainingHeader ?? "0", 10) }
        : undefined

    const body = (await response.json().catch(() => ({
      success: false,
      message: response.statusText || "Unknown error",
      data: null,
      errors: null,
    }))) as APIResponse<T>

    if (!response.ok) {
      throw this.toError(response.status, body, requestId, rateLimit)
    }

    return body
  }

  private toError(
    status: number,
    body: APIResponse<unknown>,
    requestId: string | null,
    rateLimit?: { limit: number; remaining: number },
  ): Platform5Error {
    const { message, errors } = body
    switch (status) {
      case 401:
        return new UnauthorizedError(status, message, errors, requestId)
      case 402:
        return new InsufficientBalanceError(status, message, errors, requestId)
      case 403:
        return new ForbiddenError(status, message, errors, requestId)
      case 404:
        return new NotFoundError(status, message, errors, requestId)
      case 422:
        return new ValidationError(status, message, errors, requestId)
      case 429:
        return new RateLimitError(
          status,
          message,
          errors,
          requestId,
          rateLimit?.limit ?? NaN,
          rateLimit?.remaining ?? NaN,
        )
      default:
        return new Platform5Error(status, message, errors, requestId)
    }
  }
}

export class Platform5Client {
  private http: HttpClient
  private _sms?: SmsService
  private _email?: EmailService
  private _messages?: MessagesService
  private _account?: AccountService

  constructor(config: Platform5Config) {
    this.http = new HttpClient(config)
  }

  get sms(): SmsService {
    return (this._sms ??= new SmsService(this.http))
  }

  get email(): EmailService {
    return (this._email ??= new EmailService(this.http))
  }

  get messages(): MessagesService {
    return (this._messages ??= new MessagesService(this.http))
  }

  get account(): AccountService {
    return (this._account ??= new AccountService(this.http))
  }

  async health(): Promise<void> {
    await this.http.request("GET", "/health")
  }
}

export function Platform5(config: Platform5Config): Platform5Client {
  return new Platform5Client(config)
}
