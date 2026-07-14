export { Platform5 } from "./client.js"
export type { Platform5Client } from "./client.js"

export {
  Platform5Error,
  UnauthorizedError,
  InsufficientBalanceError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
} from "./errors.js"

export type {
  Platform5Config,
  RequestOptions,
  APIResponse,
  SendSMSRequest,
  SendSMSResponse,
  SendEmailRequest,
  SendEmailResponse,
  MessageStatusResponse,
  BalanceResponse,
} from "./types.js"
