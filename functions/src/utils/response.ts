import { v4 as uuidv4 } from "uuid";
import type {
  ApiListResponse,
  ApiItemResponse,
  ApiErrorResponse,
  ApiMeta,
  PaginationInfo,
} from "../types/index.js";

const API_VERSION = "1.0.0";

function createMeta(): ApiMeta {
  return {
    requestId: uuidv4(),
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  };
}

export function createListResponse<T>(
  data: T[],
  pagination: PaginationInfo,
): ApiListResponse<T> {
  return {
    success: true,
    data,
    pagination,
    meta: createMeta(),
  };
}

export function createItemResponse<T>(data: T): ApiItemResponse<T> {
  return {
    success: true,
    data,
    meta: createMeta(),
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
    meta: createMeta(),
  };
}

export const ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;
