export class Platform5Error extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: string | null,
    public requestId: string | null,
  ) {
    super(message)
    this.name = "Platform5Error"
  }
}

export class UnauthorizedError extends Platform5Error {
  constructor(status: number, message: string, errors: string | null, requestId: string | null) {
    super(status, message, errors, requestId)
    this.name = "UnauthorizedError"
  }
}

export class InsufficientBalanceError extends Platform5Error {
  constructor(status: number, message: string, errors: string | null, requestId: string | null) {
    super(status, message, errors, requestId)
    this.name = "InsufficientBalanceError"
  }
}

export class ForbiddenError extends Platform5Error {
  constructor(status: number, message: string, errors: string | null, requestId: string | null) {
    super(status, message, errors, requestId)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends Platform5Error {
  constructor(status: number, message: string, errors: string | null, requestId: string | null) {
    super(status, message, errors, requestId)
    this.name = "NotFoundError"
  }
}

export class ValidationError extends Platform5Error {
  constructor(status: number, message: string, errors: string | null, requestId: string | null) {
    super(status, message, errors, requestId)
    this.name = "ValidationError"
  }
}

export class RateLimitError extends Platform5Error {
  limit: number
  remaining: number

  constructor(
    status: number,
    message: string,
    errors: string | null,
    requestId: string | null,
    limit: number,
    remaining: number,
  ) {
    super(status, message, errors, requestId)
    this.name = "RateLimitError"
    this.limit = limit
    this.remaining = remaining
  }
}
